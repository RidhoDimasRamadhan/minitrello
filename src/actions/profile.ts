"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { ActionState } from "@/types";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getProfile() {
  const userId = await getCurrentUserId();
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          workspaceMembers: true,
          boardMembers: true,
          cards: true,
          comments: true,
        },
      },
    },
  });
}

export async function updateProfile(data: {
  name: string;
  image?: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();

  if (!data.name.trim() || data.name.length < 2) {
    return { error: "Nama minimal 2 karakter" };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      image: data.image || undefined,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Profil berhasil diperbarui!" };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();

  if (data.newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter" };
  }

  if (data.newPassword !== data.confirmPassword) {
    return { error: "Konfirmasi password tidak cocok" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user?.password) {
    return { error: "Akun ini menggunakan login Google, tidak bisa ganti password" };
  }

  const isValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValid) {
    return { error: "Password saat ini salah" };
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: "Password berhasil diubah!" };
}

export async function deleteAccount(): Promise<ActionState> {
  const userId = await getCurrentUserId();

  // Check if user owns any workspace
  const ownedWorkspaces = await db.workspaceMember.findMany({
    where: { userId, role: "OWNER" },
    include: {
      workspace: {
        include: { _count: { select: { members: true } } },
      },
    },
  });

  const soleOwner = ownedWorkspaces.some(
    (wm) => wm.workspace._count.members === 1
  );

  // Delete workspaces where user is the only member
  for (const wm of ownedWorkspaces) {
    if (wm.workspace._count.members === 1) {
      await db.workspace.delete({ where: { id: wm.workspaceId } });
    }
  }

  await db.user.delete({ where: { id: userId } });

  return { success: "Akun berhasil dihapus" };
}

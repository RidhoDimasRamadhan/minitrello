"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { WorkspaceSchema } from "@/lib/validators";
import type { ActionState } from "@/types";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
}): Promise<ActionState & { workspaceId?: string }> {
  const userId = await getCurrentUserId();
  const validated = WorkspaceSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { name, description } = validated.data;
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

  const workspace = await db.workspace.create({
    data: {
      name,
      slug,
      description,
      createdById: userId,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: "Workspace berhasil dibuat!", workspaceId: workspace.id };
}

export async function updateWorkspace(
  workspaceId: string,
  data: { name: string; description?: string }
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const validated = WorkspaceSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || member.role === "MEMBER") {
    return { error: "Tidak memiliki akses" };
  }

  await db.workspace.update({
    where: { id: workspaceId },
    data: validated.data,
  });

  revalidatePath("/dashboard");
  return { success: "Workspace berhasil diperbarui!" };
}

export async function deleteWorkspace(
  workspaceId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || member.role !== "OWNER") {
    return { error: "Hanya owner yang dapat menghapus workspace" };
  }

  await db.workspace.delete({ where: { id: workspaceId } });
  revalidatePath("/dashboard");
  return { success: "Workspace berhasil dihapus!" };
}

export async function inviteMember(
  workspaceId: string,
  email: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || member.role === "MEMBER") {
    return { error: "Tidak memiliki akses untuk mengundang member" };
  }

  const invitedUser = await db.user.findUnique({ where: { email } });
  if (!invitedUser) return { error: "User dengan email tersebut tidak ditemukan" };

  const existing = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId: invitedUser.id, workspaceId },
    },
  });
  if (existing) return { error: "User sudah menjadi member" };

  await db.workspaceMember.create({
    data: { userId: invitedUser.id, workspaceId, role: "MEMBER" },
  });

  revalidatePath(`/workspace`);
  return { success: "Member berhasil ditambahkan!" };
}

export async function removeMember(
  workspaceId: string,
  targetUserId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || member.role === "MEMBER") {
    return { error: "Tidak memiliki akses" };
  }

  await db.workspaceMember.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });

  revalidatePath(`/workspace`);
  return { success: "Member berhasil dihapus!" };
}

export async function getWorkspaces() {
  const userId = await getCurrentUserId();
  return db.workspace.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: true } },
      boards: {
        where: { isClosed: false },
        include: { stars: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { boards: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

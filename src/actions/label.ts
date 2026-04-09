"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionState } from "@/types";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createLabel(data: {
  name?: string;
  color: string;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: data.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  await db.label.create({
    data: {
      name: data.name,
      color: data.color,
      boardId: data.boardId,
    },
  });

  revalidatePath(`/board/${data.boardId}`);
  return { success: "Label berhasil dibuat!" };
}

export async function updateLabel(
  labelId: string,
  data: { name?: string; color: string },
  boardId: string
): Promise<ActionState> {
  await db.label.update({ where: { id: labelId }, data });
  revalidatePath(`/board/${boardId}`);
  return { success: "Label berhasil diperbarui!" };
}

export async function deleteLabel(
  labelId: string,
  boardId: string
): Promise<ActionState> {
  await db.label.delete({ where: { id: labelId } });
  revalidatePath(`/board/${boardId}`);
  return { success: "Label berhasil dihapus!" };
}

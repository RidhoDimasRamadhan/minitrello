"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { POSITION_GAP } from "@/lib/constants";
import type { ActionState } from "@/types";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createChecklist(data: {
  title: string;
  cardId: string;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: data.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const lastChecklist = await db.checklist.findFirst({
    where: { cardId: data.cardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.checklist.create({
    data: {
      title: data.title,
      cardId: data.cardId,
      position: (lastChecklist?.position ?? 0) + POSITION_GAP,
    },
  });

  revalidatePath(`/board/${data.boardId}`);
  return { success: "Checklist berhasil dibuat!" };
}

export async function deleteChecklist(
  checklistId: string,
  boardId: string
): Promise<ActionState> {
  await db.checklist.delete({ where: { id: checklistId } });
  revalidatePath(`/board/${boardId}`);
  return { success: "Checklist berhasil dihapus!" };
}

export async function createChecklistItem(data: {
  text: string;
  checklistId: string;
  boardId: string;
}): Promise<ActionState> {
  const lastItem = await db.checklistItem.findFirst({
    where: { checklistId: data.checklistId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.checklistItem.create({
    data: {
      text: data.text,
      checklistId: data.checklistId,
      position: (lastItem?.position ?? 0) + POSITION_GAP,
    },
  });

  revalidatePath(`/board/${data.boardId}`);
  return { success: "Item berhasil ditambahkan!" };
}

export async function toggleChecklistItem(
  itemId: string,
  boardId: string
): Promise<ActionState> {
  const item = await db.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Item tidak ditemukan" };

  await db.checklistItem.update({
    where: { id: itemId },
    data: { isChecked: !item.isChecked },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: "Item berhasil diperbarui!" };
}

export async function deleteChecklistItem(
  itemId: string,
  boardId: string
): Promise<ActionState> {
  await db.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/board/${boardId}`);
  return { success: "Item berhasil dihapus!" };
}

export async function updateChecklistItem(
  itemId: string,
  text: string,
  boardId: string
): Promise<ActionState> {
  await db.checklistItem.update({
    where: { id: itemId },
    data: { text },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: "Item berhasil diperbarui!" };
}

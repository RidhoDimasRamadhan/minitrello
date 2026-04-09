"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ListSchema } from "@/lib/validators";
import { POSITION_GAP } from "@/lib/constants";
import type { ActionState } from "@/types";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createList(data: {
  title: string;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const validated = ListSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: validated.data.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const lastList = await db.list.findFirst({
    where: { boardId: validated.data.boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.list.create({
    data: {
      title: validated.data.title,
      boardId: validated.data.boardId,
      position: (lastList?.position ?? 0) + POSITION_GAP,
    },
  });

  await db.activity.create({
    data: {
      action: "CREATED",
      entityType: "list",
      entityId: validated.data.boardId,
      boardId: validated.data.boardId,
      userId,
      metadata: { title: validated.data.title },
    },
  });

  revalidatePath(`/board/${validated.data.boardId}`);
  return { success: "List berhasil dibuat!" };
}

export async function updateList(
  listId: string,
  data: { title: string }
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const list = await db.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  });
  if (!list) return { error: "List tidak ditemukan" };

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: list.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  await db.list.update({ where: { id: listId }, data });
  revalidatePath(`/board/${list.boardId}`);
  return { success: "List berhasil diperbarui!" };
}

export async function deleteList(listId: string): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const list = await db.list.findUnique({
    where: { id: listId },
    select: { boardId: true, title: true },
  });
  if (!list) return { error: "List tidak ditemukan" };

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: list.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  await db.list.delete({ where: { id: listId } });

  await db.activity.create({
    data: {
      action: "DELETED",
      entityType: "list",
      entityId: listId,
      boardId: list.boardId,
      userId,
      metadata: { title: list.title },
    },
  });

  revalidatePath(`/board/${list.boardId}`);
  return { success: "List berhasil dihapus!" };
}

export async function copyList(listId: string): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const list = await db.list.findUnique({
    where: { id: listId },
    include: { cards: { orderBy: { position: "asc" } } },
  });
  if (!list) return { error: "List tidak ditemukan" };

  const lastList = await db.list.findFirst({
    where: { boardId: list.boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.list.create({
    data: {
      title: `${list.title} (copy)`,
      boardId: list.boardId,
      position: (lastList?.position ?? 0) + POSITION_GAP,
      cards: {
        createMany: {
          data: list.cards.map((card) => ({
            title: card.title,
            description: card.description,
            position: card.position,
            createdById: userId,
          })),
        },
      },
    },
  });

  revalidatePath(`/board/${list.boardId}`);
  return { success: "List berhasil disalin!" };
}

export async function reorderLists(
  boardId: string,
  items: { id: string; position: number }[]
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const transaction = items.map((item) =>
    db.list.update({
      where: { id: item.id },
      data: { position: item.position },
    })
  );

  await db.$transaction(transaction);
  revalidatePath(`/board/${boardId}`);
  return { success: "Urutan list berhasil diperbarui!" };
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CardSchema, CardUpdateSchema } from "@/lib/validators";
import { POSITION_GAP } from "@/lib/constants";
import type { ActionState } from "@/types";
import { createNotification } from "./notification";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createCard(data: {
  title: string;
  listId: string;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const validated = CardSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: validated.data.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const lastCard = await db.card.findFirst({
    where: { listId: validated.data.listId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const card = await db.card.create({
    data: {
      title: validated.data.title,
      listId: validated.data.listId,
      createdById: userId,
      position: (lastCard?.position ?? 0) + POSITION_GAP,
    },
  });

  await db.activity.create({
    data: {
      action: "CREATED",
      entityType: "card",
      entityId: card.id,
      cardId: card.id,
      boardId: validated.data.boardId,
      userId,
      metadata: { title: card.title },
    },
  });

  revalidatePath(`/board/${validated.data.boardId}`);
  return { success: "Card berhasil dibuat!" };
}

export async function updateCard(data: {
  id: string;
  title?: string;
  description?: string;
  dueDate?: Date | null;
  isComplete?: boolean;
  coverColor?: string | null;
  coverImage?: string | null;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const { boardId, ...updateData } = data;

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const { id, ...fields } = updateData;
  await db.card.update({ where: { id }, data: fields });

  await db.activity.create({
    data: {
      action: "UPDATED",
      entityType: "card",
      entityId: id,
      cardId: id,
      boardId,
      userId,
      metadata: { fields: Object.keys(fields) },
    },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: "Card berhasil diperbarui!" };
}

export async function deleteCard(
  cardId: string,
  boardId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const card = await db.card.findUnique({
    where: { id: cardId },
    select: { title: true },
  });

  await db.card.delete({ where: { id: cardId } });

  await db.activity.create({
    data: {
      action: "DELETED",
      entityType: "card",
      entityId: cardId,
      boardId,
      userId,
      metadata: { title: card?.title },
    },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: "Card berhasil dihapus!" };
}

export async function moveCard(data: {
  cardId: string;
  targetListId: string;
  newPosition: number;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: data.boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const card = await db.card.findUnique({
    where: { id: data.cardId },
    include: { list: { select: { title: true } } },
  });
  const targetList = await db.list.findUnique({
    where: { id: data.targetListId },
    select: { title: true },
  });

  await db.card.update({
    where: { id: data.cardId },
    data: {
      listId: data.targetListId,
      position: data.newPosition,
    },
  });

  if (card && targetList && card.listId !== data.targetListId) {
    await db.activity.create({
      data: {
        action: "MOVED",
        entityType: "card",
        entityId: data.cardId,
        cardId: data.cardId,
        boardId: data.boardId,
        userId,
        metadata: {
          title: card.title,
          from: card.list.title,
          to: targetList.title,
        },
      },
    });
  }

  revalidatePath(`/board/${data.boardId}`);
  return { success: "Card berhasil dipindahkan!" };
}

export async function reorderCards(
  boardId: string,
  items: { id: string; position: number; listId: string }[]
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const transaction = items.map((item) =>
    db.card.update({
      where: { id: item.id },
      data: { position: item.position, listId: item.listId },
    })
  );

  await db.$transaction(transaction);
  revalidatePath(`/board/${boardId}`);
  return { success: "Urutan card berhasil diperbarui!" };
}

export async function getCard(cardId: string) {
  const userId = await getCurrentUserId();
  const card = await db.card.findUnique({
    where: { id: cardId },
    include: {
      list: { select: { title: true, boardId: true } },
      labels: { include: { label: true } },
      assignees: { include: { user: true } },
      checklists: {
        orderBy: { position: "asc" },
        include: {
          items: { orderBy: { position: "asc" } },
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
      attachments: { orderBy: { createdAt: "desc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: true },
      },
      createdBy: true,
    },
  });

  if (!card) return null;

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId: card.list.boardId } },
  });
  if (!member) return null;

  return card;
}

export async function toggleCardLabel(
  cardId: string,
  labelId: string,
  boardId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const existing = await db.cardLabel.findUnique({
    where: { cardId_labelId: { cardId, labelId } },
  });

  if (existing) {
    await db.cardLabel.delete({ where: { id: existing.id } });
  } else {
    await db.cardLabel.create({ data: { cardId, labelId } });
  }

  revalidatePath(`/board/${boardId}`);
  return { success: "Label berhasil diperbarui!" };
}

export async function toggleCardAssignee(
  cardId: string,
  targetUserId: string,
  boardId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  const existing = await db.cardAssignee.findUnique({
    where: { cardId_userId: { cardId, userId: targetUserId } },
  });

  if (existing) {
    await db.cardAssignee.delete({ where: { id: existing.id } });
  } else {
    await db.cardAssignee.create({ data: { cardId, userId: targetUserId } });

    // Notify assigned user
    if (targetUserId !== userId) {
      const card = await db.card.findUnique({ where: { id: cardId }, select: { title: true } });
      const assigner = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
      if (card && assigner) {
        await createNotification({
          userId: targetUserId,
          type: "assigned",
          title: "Kamu di-assign ke card",
          message: `${assigner.name} menambahkan kamu ke card "${card.title}"`,
          link: `/board/${boardId}`,
        });
      }
    }
  }

  revalidatePath(`/board/${boardId}`);
  return { success: "Assignee berhasil diperbarui!" };
}

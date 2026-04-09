"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CommentSchema } from "@/lib/validators";
import type { ActionState } from "@/types";
import { notifyBoardMembers } from "./notification";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createComment(data: {
  content: string;
  cardId: string;
  boardId: string;
}): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const validated = CommentSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  await db.comment.create({
    data: {
      content: validated.data.content,
      cardId: validated.data.cardId,
      userId,
    },
  });

  await db.activity.create({
    data: {
      action: "COMMENTED",
      entityType: "card",
      entityId: validated.data.cardId,
      cardId: validated.data.cardId,
      boardId: data.boardId,
      userId,
      metadata: { content: validated.data.content.slice(0, 100) },
    },
  });

  // Notify board members
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
  const card = await db.card.findUnique({ where: { id: validated.data.cardId }, select: { title: true } });
  if (user && card) {
    await notifyBoardMembers(data.boardId, userId, {
      type: "commented",
      title: "Komentar baru",
      message: `${user.name} berkomentar di card "${card.title}"`,
      link: `/board/${data.boardId}`,
    });
  }

  revalidatePath(`/board/${data.boardId}`);
  return { success: "Komentar berhasil ditambahkan!" };
}

export async function updateComment(
  commentId: string,
  content: string,
  boardId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    return { error: "Tidak memiliki akses" };
  }

  await db.comment.update({ where: { id: commentId }, data: { content } });
  revalidatePath(`/board/${boardId}`);
  return { success: "Komentar berhasil diperbarui!" };
}

export async function deleteComment(
  commentId: string,
  boardId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    return { error: "Tidak memiliki akses" };
  }

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/board/${boardId}`);
  return { success: "Komentar berhasil dihapus!" };
}

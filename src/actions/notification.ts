"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getNotifications() {
  const userId = await getCurrentUserId();
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getUnreadCount() {
  const userId = await getCurrentUserId();
  return db.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string) {
  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
}

export async function markAllAsRead() {
  const userId = await getCurrentUserId();
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  await db.notification.create({ data });
}

export async function notifyBoardMembers(
  boardId: string,
  excludeUserId: string,
  data: { type: string; title: string; message: string; link?: string }
) {
  const members = await db.boardMember.findMany({
    where: { boardId, userId: { not: excludeUserId } },
    select: { userId: true },
  });

  if (members.length === 0) return;

  await db.notification.createMany({
    data: members.map((m) => ({
      ...data,
      userId: m.userId,
    })),
  });
}

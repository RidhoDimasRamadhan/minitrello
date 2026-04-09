"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionState } from "@/types";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function uploadAttachment(formData: FormData): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const file = formData.get("file") as File;
  const cardId = formData.get("cardId") as string;
  const boardId = formData.get("boardId") as string;

  if (!file || !cardId || !boardId) {
    return { error: "Data tidak lengkap" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 5MB" };
  }

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  // Save file to public/uploads
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);

  await db.attachment.create({
    data: {
      name: file.name,
      url: `/uploads/${uniqueName}`,
      type: file.type,
      size: file.size,
      cardId,
    },
  });

  await db.activity.create({
    data: {
      action: "ADDED",
      entityType: "attachment",
      entityId: cardId,
      cardId,
      boardId,
      userId,
      metadata: { title: file.name },
    },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: "File berhasil diunggah!" };
}

export async function deleteAttachment(
  attachmentId: string,
  boardId: string
): Promise<ActionState> {
  const attachment = await db.attachment.findUnique({
    where: { id: attachmentId },
  });
  if (!attachment) return { error: "Attachment tidak ditemukan" };

  // Try to delete file from disk
  try {
    const filePath = path.join(process.cwd(), "public", attachment.url);
    await unlink(filePath);
  } catch {}

  await db.attachment.delete({ where: { id: attachmentId } });
  revalidatePath(`/board/${boardId}`);
  return { success: "Attachment berhasil dihapus!" };
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { BoardSchema } from "@/lib/validators";
import { LABEL_COLORS } from "@/lib/constants";
import type { ActionState } from "@/types";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createBoard(data: {
  title: string;
  workspaceId: string;
  backgroundColor?: string;
  backgroundImage?: string;
}): Promise<ActionState & { boardId?: string }> {
  const userId = await getCurrentUserId();
  const validated = BoardSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const member = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId: validated.data.workspaceId },
    },
  });
  if (!member) return { error: "Tidak memiliki akses ke workspace ini" };

  const board = await db.board.create({
    data: {
      title: validated.data.title,
      workspaceId: validated.data.workspaceId,
      backgroundColor: validated.data.backgroundColor || "#0079bf",
      backgroundImage: validated.data.backgroundImage,
      createdById: userId,
      members: {
        create: { userId, role: "ADMIN" },
      },
      labels: {
        createMany: {
          data: LABEL_COLORS.map((lc) => ({
            name: lc.name,
            color: lc.value,
          })),
        },
      },
    },
  });

  await db.activity.create({
    data: {
      action: "CREATED",
      entityType: "board",
      entityId: board.id,
      boardId: board.id,
      userId,
      metadata: { title: board.title },
    },
  });

  revalidatePath("/dashboard");
  return { success: "Board berhasil dibuat!", boardId: board.id };
}

export async function updateBoard(
  boardId: string,
  data: {
    title?: string;
    description?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    isClosed?: boolean;
  }
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role === "VIEWER") {
    return { error: "Tidak memiliki akses" };
  }

  await db.board.update({ where: { id: boardId }, data });
  revalidatePath(`/board/${boardId}`);
  revalidatePath("/dashboard");
  return { success: "Board berhasil diperbarui!" };
}

export async function deleteBoard(boardId: string): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role !== "ADMIN") {
    return { error: "Hanya admin yang dapat menghapus board" };
  }

  await db.board.delete({ where: { id: boardId } });
  revalidatePath("/dashboard");
  return { success: "Board berhasil dihapus!" };
}

export async function toggleStarBoard(boardId: string): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const existing = await db.boardStar.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });

  if (existing) {
    await db.boardStar.delete({ where: { id: existing.id } });
  } else {
    await db.boardStar.create({ data: { userId, boardId } });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/board/${boardId}`);
  return { success: existing ? "Bintang dihapus" : "Board dibintangi!" };
}

export async function getBoard(boardId: string) {
  const userId = await getCurrentUserId();
  const board = await db.board.findUnique({
    where: { id: boardId },
    include: {
      lists: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              labels: { include: { label: true } },
              assignees: { include: { user: true } },
              checklists: { include: { items: true } },
              comments: true,
              attachments: true,
              _count: { select: { comments: true, attachments: true } },
            },
          },
        },
      },
      labels: true,
      members: { include: { user: true } },
      stars: { where: { userId } },
      workspace: true,
      createdBy: true,
    },
  });

  if (!board) return null;

  const isMember = board.members.some((m) => m.userId === userId);
  if (!isMember) return null;

  return board;
}

export async function inviteBoardMember(
  boardId: string,
  email: string,
  role: "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER"
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  if (!member || member.role !== "ADMIN") {
    return { error: "Hanya admin yang dapat mengundang member" };
  }

  const invitedUser = await db.user.findUnique({ where: { email } });
  if (!invitedUser) return { error: "User tidak ditemukan" };

  const existing = await db.boardMember.findUnique({
    where: { userId_boardId: { userId: invitedUser.id, boardId } },
  });
  if (existing) return { error: "User sudah menjadi member board" };

  await db.boardMember.create({
    data: { userId: invitedUser.id, boardId, role },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: "Member berhasil ditambahkan!" };
}

export async function cloneBoardAsTemplate(
  boardId: string,
  title: string,
  workspaceId: string
): Promise<ActionState & { boardId?: string }> {
  const userId = await getCurrentUserId();
  const sourceBoard = await db.board.findUnique({
    where: { id: boardId },
    include: {
      lists: {
        include: { cards: true },
        orderBy: { position: "asc" },
      },
      labels: true,
    },
  });

  if (!sourceBoard) return { error: "Board template tidak ditemukan" };

  const newBoard = await db.board.create({
    data: {
      title,
      workspaceId,
      backgroundColor: sourceBoard.backgroundColor,
      backgroundImage: sourceBoard.backgroundImage,
      createdById: userId,
      members: { create: { userId, role: "ADMIN" } },
      labels: {
        createMany: {
          data: sourceBoard.labels.map((l) => ({ name: l.name, color: l.color })),
        },
      },
      lists: {
        createMany: {
          data: sourceBoard.lists.map((l) => ({
            title: l.title,
            position: l.position,
          })),
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: "Board berhasil dibuat dari template!", boardId: newBoard.id };
}

import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const WorkspaceSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
  description: z.string().max(500).optional(),
});

export const BoardSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(100),
  workspaceId: z.string().cuid(),
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export const ListSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(100),
  boardId: z.string().cuid(),
});

export const CardSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  listId: z.string().cuid(),
  boardId: z.string().cuid(),
});

export const CardUpdateSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.date().nullable().optional(),
  isComplete: z.boolean().optional(),
  coverColor: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
});

export const CommentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong"),
  cardId: z.string().cuid(),
});

export const ChecklistSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  cardId: z.string().cuid(),
});

export const ChecklistItemSchema = z.object({
  text: z.string().min(1, "Item tidak boleh kosong"),
  checklistId: z.string().cuid(),
});

export const LabelSchema = z.object({
  name: z.string().max(50).optional(),
  color: z.string(),
  boardId: z.string().cuid(),
});

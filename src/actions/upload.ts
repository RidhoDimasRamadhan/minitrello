"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File;
  if (!file) return { error: "File tidak ditemukan" };

  if (!file.type.startsWith("image/")) {
    return { error: "File harus berupa gambar" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 5MB" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", "backgrounds");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() || "jpg";
  const uniqueName = `bg-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);

  return { url: `/uploads/backgrounds/${uniqueName}` };
}

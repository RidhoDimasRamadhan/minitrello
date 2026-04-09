"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validators";
import type { ActionState } from "@/types";

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionState> {
  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, email, password } = validated.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Create default workspace for new user
  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-workspace`;
  await db.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      slug: `${slug}-${user.id.slice(0, 6)}`,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  return { success: "Registrasi berhasil! Silakan login." };
}

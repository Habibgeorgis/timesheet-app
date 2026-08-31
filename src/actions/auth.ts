"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export type AuthState = { error?: string };

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Enter a valid email and password." };
  const user = await prisma.user.findUnique({ where: { email: result.data.email } });
  if (!user || !user.active || !(await bcrypt.compare(result.data.password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

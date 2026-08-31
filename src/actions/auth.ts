"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthState = { error?: string };
export type SignupField = "name" | "email" | "password" | "passwordConfirmation" | "role";
export type SignupState = {
  error?: string;
  fieldErrors?: Partial<Record<SignupField,string>>;
  values?: { name:string;email:string;role:"EMPLOYEE"|"MANAGER" };
};

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

export async function signup(_: SignupState, formData: FormData): Promise<SignupState> {
  const raw=Object.fromEntries(formData);
  const values={name:String(raw.name??""),email:String(raw.email??""),role:raw.role==="MANAGER"?"MANAGER" as const:"EMPLOYEE" as const};
  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors:SignupState["fieldErrors"]={};
    for(const issue of result.error.issues){const field=issue.path[0] as SignupField|undefined;if(field&&!fieldErrors[field])fieldErrors[field]=issue.message}
    return {fieldErrors,values};
  }

  const { name, email, password, role } = result.data;
  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 12), role },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors:{email:"This email is already registered"},values };
    }
    return { error: "We could not create your account. Please try again.",values };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

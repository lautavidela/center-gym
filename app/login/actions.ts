"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { getSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá email y contraseña." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { gym: true },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Email o contraseña incorrectos." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  await session.save();

  redirect(user.gym ? `/g/${user.gym.slug}/admin` : "/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";

export type CreateGymState = {
  error?: string;
  url?: string;
  email?: string;
};

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "gym"
  );
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.gym.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createGym(
  _prev: CreateGymState,
  formData: FormData
): Promise<CreateGymState> {
  const { user } = await requireAdmin();
  if (!user.isSuperAdmin) return { error: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const ownerPassword = String(formData.get("ownerPassword") ?? "");

  if (!name) return { error: "El nombre del gimnasio es obligatorio." };
  if (!ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail))
    return { error: "Email del dueño inválido." };
  if (ownerPassword.length < 6)
    return { error: "La contraseña del dueño debe tener al menos 6 caracteres." };

  const emailTaken = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (emailTaken) return { error: "Ya existe un usuario con ese email." };

  const slug = await uniqueSlug(slugify(name));

  const gym = await prisma.gym.create({
    data: { slug, name },
  });

  await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash: hashPassword(ownerPassword),
      gymId: gym.id,
      isSuperAdmin: false,
    },
  });

  await prisma.plan.createMany({
    data: [
      { gymId: gym.id, name: "Mensual 3 días", classesPerMonth: 12, price: 25000 },
      { gymId: gym.id, name: "Mensual todos los días", classesPerMonth: 20, price: 30000 },
    ],
  });

  revalidatePath("/admin");
  return { url: `/g/${gym.slug}/admin`, email: ownerEmail };
}
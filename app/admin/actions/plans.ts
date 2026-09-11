"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type PlanFormState = { error?: string };

export async function createPlan(
  _prev: PlanFormState,
  formData: FormData
): Promise<PlanFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const durationDays = Number(formData.get("durationDays"));
  const price = Number(formData.get("price")) || 0;

  if (!name) return { error: "El nombre del plan es obligatorio." };
  if (!Number.isInteger(durationDays) || durationDays <= 0)
    return { error: "La duración debe ser un número de días mayor a 0." };
  if (price < 0) return { error: "El precio no puede ser negativo." };

  await prisma.plan.create({
    data: { name, durationDays, price },
  });
  revalidatePath("/admin/planes");
  return {};
}

export async function updatePlan(
  id: number,
  _prev: PlanFormState,
  formData: FormData
): Promise<PlanFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const durationDays = Number(formData.get("durationDays"));
  const price = Number(formData.get("price")) || 0;

  if (!name) return { error: "El nombre del plan es obligatorio." };
  if (!Number.isInteger(durationDays) || durationDays <= 0)
    return { error: "La duración debe ser un número de días mayor a 0." };
  if (price < 0) return { error: "El precio no puede ser negativo." };

  await prisma.plan.update({
    where: { id },
    data: { name, durationDays, price },
  });
  revalidatePath("/admin/planes");
  return {};
}

export async function togglePlanActive(id: number) {
  await requireAdmin();
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return;
  await prisma.plan.update({
    where: { id },
    data: { isActive: !plan.isActive },
  });
  revalidatePath("/admin/planes");
}

export async function deletePlan(id: number) {
  await requireAdmin();
  const used = await prisma.payment.count({ where: { planId: id } });
  if (used > 0) {
    await prisma.plan.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.plan.deleteMany({ where: { id } });
    await prisma.membership.updateMany({
      where: { planId: id },
      data: { planId: null },
    });
  }
  revalidatePath("/admin/planes");
}
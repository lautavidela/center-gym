"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGymAdmin } from "@/lib/auth";

export type PlanFormState = { error?: string };

export async function createPlan(
  _prev: PlanFormState,
  formData: FormData
): Promise<PlanFormState> {
  const { gymId, gym } = await requireGymAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const classesPerMonth = Number(formData.get("classesPerMonth"));
  const price = Number(formData.get("price")) || 0;

  if (!name) return { error: "El nombre del plan es obligatorio." };
  if (!Number.isInteger(classesPerMonth) || classesPerMonth <= 0)
    return { error: "Las clases por mes deben ser un número mayor a 0." };
  if (price < 0) return { error: "El precio no puede ser negativo." };

  await prisma.plan.create({
    data: { gymId: gymId, name, classesPerMonth, price },
  });
  revalidatePath(`/g/${gym.slug}/admin/planes`);
  return {};
}

export async function updatePlan(
  id: number,
  _prev: PlanFormState,
  formData: FormData
): Promise<PlanFormState> {
  const { gymId, gym } = await requireGymAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const classesPerMonth = Number(formData.get("classesPerMonth"));
  const price = Number(formData.get("price")) || 0;

  if (!name) return { error: "El nombre del plan es obligatorio." };
  if (!Number.isInteger(classesPerMonth) || classesPerMonth <= 0)
    return { error: "Las clases por mes deben ser un número mayor a 0." };
  if (price < 0) return { error: "El precio no puede ser negativo." };

  const owned = await prisma.plan.findFirst({ where: { id, gymId: gymId } });
  if (!owned) return { error: "El plan no existe en tu gimnasio." };

  await prisma.plan.update({
    where: { id },
    data: { name, classesPerMonth, price },
  });
  revalidatePath(`/g/${gym.slug}/admin/planes`);
  return {};
}

export async function togglePlanActive(id: number) {
  const { gymId, gym } = await requireGymAdmin();
  const plan = await prisma.plan.findFirst({
    where: { id, gymId: gymId },
  });
  if (!plan) return;
  await prisma.plan.update({
    where: { id },
    data: { isActive: !plan.isActive },
  });
  revalidatePath(`/g/${gym.slug}/admin/planes`);
}

export async function deletePlan(id: number) {
  const { gymId, gym } = await requireGymAdmin();
  const used = await prisma.payment.count({ where: { planId: id, gymId: gymId } });
  if (used > 0) {
    await prisma.plan.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.plan.deleteMany({ where: { id, gymId: gymId } });
    await prisma.membership.updateMany({
      where: { planId: id },
      data: { planId: null },
    });
  }
  revalidatePath(`/g/${gym.slug}/admin/planes`);
}
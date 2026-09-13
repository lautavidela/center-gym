"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGymAdmin } from "@/lib/auth";
import { addMonths, parseDni, parseExcelDate, startOfDay } from "@/lib/dates";

export type ClientFormState = { error?: string };

async function makeMembership(
  clientId: number,
  planId: number,
  gymId: number
) {
  const plan = await prisma.plan.findFirst({
    where: { id: planId, gymId },
  });
  if (!plan) return;

  const today = startOfDay(new Date());
  const endDate = addMonths(today, 1);

  const membership = await prisma.membership.create({
    data: {
      clientId,
      planId: plan.id,
      gymId,
      startDate: today,
      endDate,
      isActive: true,
    },
  });

  await prisma.payment.create({
    data: {
      clientId,
      planId: plan.id,
      membershipId: membership.id,
      gymId,
      amount: plan.price,
      method: "efectivo",
      paidAt: today,
      notes: "Alta inicial",
    },
  });
}

export async function createClient(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { gymId, gym } = await requireGymAdmin();

  const dni = parseDni(formData.get("dni"));
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const planRaw = String(formData.get("planId") ?? "").trim();

  if (!name) return { error: "El nombre es obligatorio." };
  if (!dni) return { error: "El DNI es obligatorio." };
  if (dni.length < 6 || dni.length > 11)
    return { error: "El DNI no parece válido." };

  const existing = await prisma.client.findFirst({
    where: { gymId, dni },
  });
  if (existing) return { error: `Ya existe un socio con DNI ${dni}.` };

  const client = await prisma.client.create({
    data: { gymId, dni, name, phone, email, notes },
  });

  const planId = planRaw ? Number(planRaw) : null;
  if (planId && !Number.isNaN(planId)) {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, gymId },
    });
    if (plan) await makeMembership(client.id, plan.id, gymId);
  }

  revalidatePath(`/g/${gym.slug}/admin/clientes`);
  redirect(`/g/${gym.slug}/admin/clientes/${client.id}`);
}

export async function updateClient(
  id: number,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { gymId, gym } = await requireGymAdmin();

  const dni = parseDni(formData.get("dni"));
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) return { error: "El nombre es obligatorio." };
  if (!dni) return { error: "El DNI es obligatorio." };

  const owned = await prisma.client.findFirst({
    where: { id, gymId },
  });
  if (!owned) return { error: "El cliente no existe en tu gimnasio." };

  if (dni) {
    const existing = await prisma.client.findFirst({
      where: { gymId, dni, NOT: { id } },
    });
    if (existing)
      return { error: `Ya existe otro socio con DNI ${dni}.` };
  }

  await prisma.client.update({
    where: { id },
    data: { dni, name, phone, email, notes },
  });
  revalidatePath(`/g/${gym.slug}/admin/clientes`);
  revalidatePath(`/g/${gym.slug}/admin/clientes/${id}`);
  return {};
}

export async function setClientSuspended(id: number, suspended: boolean) {
  const { gymId, gym } = await requireGymAdmin();
  const owned = await prisma.client.findFirst({ where: { id, gymId } });
  if (!owned) return;
  await prisma.client.update({
    where: { id },
    data: { isSuspended: suspended },
  });
  revalidatePath(`/g/${gym.slug}/admin/clientes`);
  revalidatePath(`/g/${gym.slug}/admin/clientes/${id}`);
}

export async function deleteClient(id: number) {
  const { gymId, gym } = await requireGymAdmin();
  await prisma.client.deleteMany({ where: { id, gymId } });
  revalidatePath(`/g/${gym.slug}/admin/clientes`);
  redirect(`/g/${gym.slug}/admin/clientes`);
}

export async function addManualMembership(
  clientId: number,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { gymId, gym } = await requireGymAdmin();

  const owned = await prisma.client.findFirst({
    where: { id: clientId, gymId },
  });
  if (!owned) return { error: "El cliente no existe en tu gimnasio." };

  const planId = Number(formData.get("planId"));
  const startRaw = String(formData.get("startDate") ?? "").trim();
  const endRaw = String(formData.get("endDate") ?? "").trim();

  const plan = await prisma.plan.findFirst({
    where: { id: planId, gymId },
  });
  if (!plan) return { error: "Seleccioná un plan válido." };

  const startDate =
    startRaw && parseExcelDate(startRaw)
      ? parseExcelDate(startRaw)!
      : startOfDay(new Date());

  let endDate: Date | null = endRaw && parseExcelDate(endRaw) ? parseExcelDate(endRaw) : null;
  if (!endDate) {
    endDate = addMonths(startDate, 1);
  }

  await prisma.membership.updateMany({
    where: { clientId, isActive: true },
    data: { isActive: false },
  });
  await prisma.membership.create({
    data: {
      clientId,
      planId: plan.id,
      gymId,
      startDate,
      endDate,
      isActive: true,
    },
  });

  revalidatePath(`/g/${gym.slug}/admin/clientes`);
  revalidatePath(`/g/${gym.slug}/admin/clientes/${clientId}`);
  return {};
}
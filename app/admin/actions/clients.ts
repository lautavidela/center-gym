"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { addDays, parseDni, parseExcelDate, startOfDay } from "@/lib/dates";

export type ClientFormState = { error?: string };

async function makeMembership(clientId: number, planId: number) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return;

  const today = startOfDay(new Date());
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const membership = await prisma.membership.create({
    data: {
      clientId,
      planId: plan.id,
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
  await requireAdmin();

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

  const existing = await prisma.client.findUnique({ where: { dni } });
  if (existing) return { error: `Ya existe un socio con DNI ${dni}.` };

  const client = await prisma.client.create({
    data: { dni, name, phone, email, notes },
  });

  const planId = planRaw ? Number(planRaw) : null;
  if (planId && !Number.isNaN(planId)) {
    await makeMembership(client.id, planId);
  }

  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${client.id}`);
}

export async function updateClient(
  id: number,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireAdmin();

  const dni = parseDni(formData.get("dni"));
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) return { error: "El nombre es obligatorio." };
  if (!dni) return { error: "El DNI es obligatorio." };

  if (dni) {
    const existing = await prisma.client.findFirst({
      where: { dni, NOT: { id } },
    });
    if (existing)
      return { error: `Ya existe otro socio con DNI ${dni}.` };
  }

  await prisma.client.update({
    where: { id },
    data: { dni, name, phone, email, notes },
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return {};
}

export async function setClientSuspended(id: number, suspended: boolean) {
  await requireAdmin();
  await prisma.client.update({
    where: { id },
    data: { isSuspended: suspended },
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
}

export async function deleteClient(id: number) {
  await requireAdmin();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function addManualMembership(
  clientId: number,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireAdmin();

  const planId = Number(formData.get("planId"));
  const startRaw = String(formData.get("startDate") ?? "").trim();
  const endRaw = String(formData.get("endDate") ?? "").trim();

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Seleccioná un plan válido." };

  const startDate =
    startRaw && parseExcelDate(startRaw)
      ? parseExcelDate(startRaw)!
      : startOfDay(new Date());

  let endDate: Date | null = endRaw && parseExcelDate(endRaw) ? parseExcelDate(endRaw) : null;
  if (!endDate) {
    endDate = addDays(startDate, plan.durationDays);
  }

  await prisma.membership.updateMany({
    where: { clientId, isActive: true },
    data: { isActive: false },
  });
  await prisma.membership.create({
    data: { clientId, planId: plan.id, startDate, endDate, isActive: true },
  });

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${clientId}`);
  return {};
}
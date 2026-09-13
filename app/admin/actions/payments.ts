"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGymAdmin } from "@/lib/auth";
import {
  computeMembershipDates,
  formatDate,
  parseExcelDate,
  startOfDay,
} from "@/lib/dates";

export type PaymentFormState = {
  error?: string;
  success?: boolean;
  endDate?: string;
};

export async function registerPayment(
  clientId: number,
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { gymId, gym } = await requireGymAdmin();

  const planRaw = String(formData.get("planId") ?? "").trim();
  const planId = Number(planRaw);
  const method = String(formData.get("method") ?? "efectivo").trim() || "efectivo";
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!Number.isInteger(planId)) return { error: "Seleccioná un plan." };
  const plan = await prisma.plan.findFirst({
    where: { id: planId, gymId: gymId, isActive: true },
  });
  if (!plan) return { error: "El plan seleccionado no existe o está inactivo." };

  const client = await prisma.client.findFirst({
    where: { id: clientId, gymId: gymId },
  });
  if (!client) return { error: "El cliente no existe." };

  let paidAt: Date;
  if (paidAtRaw) {
    const parsed = parseExcelDate(paidAtRaw);
    if (!parsed) return { error: "La fecha de pago no es válida." };
    paidAt = parsed;
  } else {
    paidAt = startOfDay(new Date());
  }

  const amount = amountRaw ? Number(amountRaw) : plan.price;
  if (!Number.isFinite(amount) || amount < 0)
    return { error: "El monto no es válido." };

  const current = await prisma.membership.findFirst({
    where: { clientId, gymId: gymId, isActive: true },
    orderBy: { endDate: "desc" },
  });

  const { startDate, endDate } = computeMembershipDates(
    paidAt,
    current?.endDate ?? null
  );

  await prisma.membership.updateMany({
    where: { clientId, gymId: gymId, isActive: true },
    data: { isActive: false },
  });

  const membership = await prisma.membership.create({
    data: {
      clientId,
      planId: plan.id,
      gymId: gymId,
      startDate,
      endDate,
      isActive: true,
    },
  });

  await prisma.payment.create({
    data: {
      clientId,
      planId: plan.id,
      membershipId: membership.id,
      gymId: gymId,
      amount,
      method,
      paidAt,
      notes,
    },
  });

  const base = `/g/${gym.slug}/admin`;
  revalidatePath(base);
  revalidatePath(`${base}/vencimientos`);
  revalidatePath(`${base}/clientes`);
  revalidatePath(`${base}/clientes/${clientId}`);
  return { success: true, endDate: formatDate(endDate) };
}
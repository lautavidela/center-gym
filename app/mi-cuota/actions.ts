"use server";

import { prisma } from "@/lib/prisma";
import { daysUntil, formatDate, startOfDay } from "@/lib/dates";

export type ConsultaResult = {
  ok: boolean;
  message?: string;
  client?: {
    name: string;
    phone: string | null;
    plan: string | null;
    startDate: string;
    endDate: string;
    status: "al-dia" | "vence-hoy" | "vencido";
    daysLeft: number;
    payments: {
      date: string;
      plan: string;
      amount: number;
      method: string;
    }[];
  };
};

export async function consultarSocio(
  _prev: ConsultaResult | null,
  formData: FormData
): Promise<ConsultaResult> {
  const rawDni = String(formData.get("dni") ?? "").trim();
  const dni = rawDni.replace(/\D/g, "");

  if (!dni) {
    return { ok: false, message: "Ingresá tu DNI para consultar." };
  }

  const client = await prisma.client.findUnique({
    where: { dni },
    include: {
      memberships: {
        where: { isActive: true },
        orderBy: { endDate: "desc" },
        take: 1,
        include: { plan: true },
      },
      payments: {
        orderBy: { paidAt: "desc" },
        take: 5,
        include: { plan: true },
      },
    },
  });

  if (!client) {
    return {
      ok: false,
      message: "No encontramos un socio con ese DNI.",
    };
  }

  const membership = client.memberships[0];
  if (!membership) {
    return {
      ok: false,
      message: `${client.name}: todavía no tiene una membresía cargada. Consultá con la administración.`,
    };
  }

  const today = startOfDay(new Date());
  const daysLeft = daysUntil(today, membership.endDate);
  const status: "al-dia" | "vence-hoy" | "vencido" =
    daysLeft > 0 ? "al-dia" : daysLeft === 0 ? "vence-hoy" : "vencido";

  return {
    ok: true,
    client: {
      name: client.name,
      phone: client.phone,
      plan: membership.plan?.name ?? null,
      startDate: formatDate(membership.startDate),
      endDate: formatDate(membership.endDate),
      status,
      daysLeft,
      payments: client.payments.map((p) => ({
        date: formatDate(p.paidAt),
        plan: p.plan?.name ?? "—",
        amount: p.amount,
        method: p.method,
      })),
    },
  };
}
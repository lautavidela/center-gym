"use server";

import { prisma } from "@/lib/prisma";
import {
  activeMembershipsArgs,
  buildConsultaView,
  clientRoutineArgs,
  recentPaymentsArgs,
} from "@/lib/consulta";
import type { RoutineExerciseView } from "@/components/routine-section";

export type ConsultaResult = {
  ok: boolean;
  message?: string;
  client?: {
    name: string;
    phone: string | null;
    plan: string | null;
    planDetail: string | null;
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
    routine: RoutineExerciseView[];
  };
};

export async function consultarSocio(
  _prev: ConsultaResult | null,
  formData: FormData
): Promise<ConsultaResult> {
  const rawGymId = String(formData.get("gymId") ?? "").trim();
  const gymId = Number(rawGymId);

  if (!Number.isInteger(gymId) || gymId <= 0) {
    return { ok: false, message: "Gimnasio inválido." };
  }

  const rawDni = String(formData.get("dni") ?? "").trim();
  const dni = rawDni.replace(/\D/g, "");

  if (!dni) {
    return { ok: false, message: "Ingresá tu DNI para consultar." };
  }

  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) {
    return { ok: false, message: "Gimnasio inválido." };
  }

  const client = await prisma.client.findFirst({
    where: { gymId, dni },
    include: {
      gym: true,
      memberships: activeMembershipsArgs,
      payments: recentPaymentsArgs,
      routineExercises: clientRoutineArgs,
    },
  });

  if (!client) {
    return {
      ok: false,
      message: "No encontramos un socio con ese DNI.",
    };
  }

  const view = buildConsultaView(client);
  if (!view.hasMembership) {
    return {
      ok: false,
      message: `${view.clientName}: todavía no tiene una membresía cargada. Consultá con la administración.`,
    };
  }

  return {
    ok: true,
    client: {
      name: view.clientName,
      phone: view.phone,
      plan: view.plan,
      planDetail: view.planDetail,
      startDate: view.startDate!,
      endDate: view.endDate!,
      status: view.status!,
      daysLeft: view.daysLeft!,
      payments: view.payments,
      routine: view.routine,
    },
  };
}
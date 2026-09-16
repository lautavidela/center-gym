"use server";

import { prisma } from "@/lib/prisma";
import {
  activeMembershipsArgs,
  buildConsultaView,
  clientRoutineArgs,
  recentPaymentsArgs,
  type ConsultaView,
} from "@/lib/consulta";

export type ConsultaGlobalResult =
  | { ok: false; message: string }
  | {
      ok: true;
      multiple: boolean;
      results: ConsultaView[];
    };

export async function consultarSocioGlobal(
  _prev: ConsultaGlobalResult | null,
  formData: FormData
): Promise<ConsultaGlobalResult> {
  const rawDni = String(formData.get("dni") ?? "").trim();
  const dni = rawDni.replace(/\D/g, "");

  if (!dni) {
    return { ok: false, message: "Ingresá tu DNI para consultar." };
  }

  const clients = await prisma.client.findMany({
    where: { dni },
    include: {
      gym: true,
      memberships: activeMembershipsArgs,
      payments: recentPaymentsArgs,
      routineExercises: clientRoutineArgs,
    },
  });

  if (clients.length === 0) {
    return {
      ok: false,
      message: "No encontramos un socio con ese DNI en ningún gimnasio.",
    };
  }

  const results = clients.map(buildConsultaView);

  return {
    ok: true,
    multiple: results.length > 1,
    results,
  };
}
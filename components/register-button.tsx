"use client";

import { useActionState } from "react";
import {
  registerAttendance,
  type AttendanceFormState,
} from "@/app/admin/actions/attendance";

export default function RegisterButton({
  clientId,
  clientName,
  alreadyToday,
  suspended,
  vencido,
}: {
  clientId: number;
  clientName: string;
  alreadyToday: boolean;
  suspended: boolean;
  vencido: boolean;
}) {
  const [state, formAction, isPending] = useActionState<
    AttendanceFormState,
    FormData
  >(registerAttendance.bind(null, clientId), {});

  if (state.success) {
    return (
      <span className="text-sm font-medium text-emerald-600">
        ✓ {state.clientName ?? clientName} registrado
      </span>
    );
  }

  if (alreadyToday) {
    return (
      <span className="text-sm text-zinc-400">Ya asistió hoy</span>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      {vencido && (
        <span className="text-xs font-medium text-red-600">
          ⚠ Socio vencido
        </span>
      )}
      {suspended && (
        <span className="text-xs font-medium text-amber-600">Suspendido</span>
      )}
      {state.error && (
        <span className="text-xs font-medium text-red-600">{state.error}</span>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "…" : "Marcar asistencia"}
      </button>
    </form>
  );
}
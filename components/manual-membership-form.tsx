"use client";

import { useActionState } from "react";
import type { Plan } from "@prisma/client";
import { formatMoney } from "@/lib/dates";
import { formatDurationLabel } from "@/lib/plans";
import {
  addManualMembership,
  type ClientFormState,
} from "@/app/admin/actions/clients";

export default function ManualMembershipForm({
  clientId,
  plans,
}: {
  clientId: number;
  plans: Plan[];
}) {
  const [state, formAction, isPending] = useActionState<ClientFormState, FormData>(
    addManualMembership.bind(null, clientId),
    {}
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5"
    >
      <h3 className="font-bold">Asignar membresía sin pago</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Para cargar el vencimiento de socios traídos desde Excel o corregir fechas
        (no se registra pago).
      </p>
      {state.error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-zinc-700">
          Plan
          <select
            name="planId"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatDurationLabel(p.durationDays)} ·{" "}
                {formatMoney(p.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Inicio (vacío = hoy)
          <input
            type="date"
            name="startDate"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Vencimiento (vacío = según plan)
          <input
            type="date"
            name="endDate"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-white transition hover:bg-zinc-900 disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Asignar membresía"}
      </button>
    </form>
  );
}
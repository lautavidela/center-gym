"use client";

import { useState, useActionState } from "react";
import type { Plan } from "@prisma/client";
import { formatPlanOption } from "@/lib/plans";
import {
  registerPayment,
  type PaymentFormState,
} from "@/app/admin/actions/payments";

export default function PaymentForm({
  clientId,
  plans,
  currentPlanId,
  clientSuspended,
}: {
  clientId: number;
  plans: Plan[];
  currentPlanId?: number | null;
  clientSuspended: boolean;
}) {
  const [state, formAction, isPending] = useActionState<PaymentFormState, FormData>(
    registerPayment.bind(null, clientId),
    {}
  );
  const defaultPlan = plans.find((p) => p.id === currentPlanId) ?? plans[0];
  const [amount, setAmount] = useState<number | null>(defaultPlan?.price ?? null);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold">Registrar pago / renovar</h2>
      {clientSuspended && (
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Atención: este socio está suspendido.
        </p>
      )}
      {state.error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && state.endDate && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Pago registrado. Membresía renovada hasta el <b>{state.endDate}</b>.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
          Plan
          <select
            name="planId"
            required
            defaultValue={defaultPlan?.id ?? ""}
            onChange={(e) => {
              const p = plans.find((x) => x.id === Number(e.target.value));
              setAmount(p ? p.price : null);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {formatPlanOption(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Monto ($)
          <input
            type="number"
            name="amount"
            min="0"
            step="any"
            value={amount ?? ""}
            onChange={(e) =>
              setAmount(e.target.value === "" ? null : Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Medio de pago
          <select
            name="method"
            defaultValue="efectivo"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Fecha de pago (vacío = hoy)
          <input
            type="date"
            name="paidAt"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Nota
          <input
            type="text"
            name="notes"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "Registrando…" : "Registrar pago"}
      </button>
    </form>
  );
}
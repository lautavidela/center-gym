"use client";

import { useActionState } from "react";
import type { Plan } from "@prisma/client";
import {
  registerPayment,
  type PaymentFormState,
} from "@/app/admin/actions/payments";

export default function QuickPayForm({
  clientId,
  plans,
  defaultPlanId,
}: {
  clientId: number;
  plans: Plan[];
  defaultPlanId?: number | null;
}) {
  const [state, formAction, isPending] = useActionState<PaymentFormState, FormData>(
    registerPayment.bind(null, clientId),
    {}
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select
        name="planId"
        defaultValue={defaultPlanId ?? plans[0]?.id ?? ""}
        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
      >
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "…" : "Registrar pago"}
      </button>
      {state.error && (
        <span className="text-xs font-medium text-red-600">{state.error}</span>
      )}
      {state.success && (
        <span className="text-xs font-medium text-emerald-600">
          ✓ Renovado{state.endDate ? ` hasta ${state.endDate}` : ""}
        </span>
      )}
    </form>
  );
}
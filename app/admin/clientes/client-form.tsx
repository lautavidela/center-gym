"use client";

import { useActionState } from "react";
import type { Plan } from "@prisma/client";
import { formatMoney } from "@/lib/dates";
import type { ClientFormState } from "@/app/admin/actions/clients";

type Props = {
  action: (
    prev: ClientFormState,
    formData: FormData
  ) => Promise<ClientFormState>;
  plans: Plan[];
  submitLabel: string;
  defaults?: {
    dni?: string;
    name?: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  };
};

export default function ClientForm({
  action,
  plans,
  submitLabel,
  defaults,
}: Props) {
  const [state, formAction, isPending] = useActionState<ClientFormState, FormData>(
    action,
    {}
  );

  return (
    <form
      action={formAction}
      className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      {state.error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          DNI
          <input
            type="text"
            name="dni"
            inputMode="numeric"
            required
            defaultValue={defaults?.dni}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Nombre completo
          <input
            type="text"
            name="name"
            required
            defaultValue={defaults?.name}
            placeholder="Juan Pérez"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Teléfono
          <input
            type="text"
            name="phone"
            defaultValue={defaults?.phone ?? ""}
            placeholder="11 5555 5555"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            defaultValue={defaults?.email ?? ""}
            placeholder="cliente@mail.com"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
          Notas
          <textarea
            name="notes"
            rows={2}
            defaultValue={defaults?.notes ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>

        {plans.length > 0 && (
          <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
            Plan inicial (opcional)
            <select
              name="planId"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Sin plan por ahora</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatMoney(p.price)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <a
          href="/admin/clientes"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
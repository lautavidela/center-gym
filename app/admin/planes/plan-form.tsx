"use client";

import { useActionState } from "react";
import { createPlan, type PlanFormState } from "@/app/admin/actions/plans";

export default function PlanForm() {
  const [state, formAction, isPending] = useActionState<PlanFormState, FormData>(
    createPlan,
    {}
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold">Nuevo plan</h2>
      {state.error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-zinc-700 sm:col-span-3">
          Nombre
          <input
            type="text"
            name="name"
            required
            placeholder="Ej: Mensual, Trimestral…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Duración (días)
          <input
            type="number"
            name="durationDays"
            required
            min="1"
            placeholder="30"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Precio ($)
          <input
            type="number"
            name="price"
            min="0"
            step="any"
            placeholder="25000"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Crear plan"}
          </button>
        </div>
      </div>
    </form>
  );
}
"use client";

import { useState, useActionState } from "react";
import type { Plan } from "@prisma/client";
import { formatMoney } from "@/lib/dates";
import { formatClassesLabel } from "@/lib/plans";
import {
  deletePlan,
  togglePlanActive,
  updatePlan,
  type PlanFormState,
} from "@/app/admin/actions/plans";

export default function PlanRow({ plan }: { plan: Plan }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState<PlanFormState, FormData>(
    updatePlan.bind(null, plan.id),
    {}
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold">{plan.name}</p>
            {!plan.isActive && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">
                inactivo
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            {formatClassesLabel(plan.classesPerMonth)} · {formatMoney(plan.price)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form action={togglePlanActive.bind(null, plan.id)}>
            <button
              type="submit"
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                plan.isActive
                  ? "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {plan.isActive ? "Desactivar" : "Activar"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
          <form
            action={deletePlan.bind(null, plan.id)}
            onSubmit={(e) => {
              if (!confirm(`¿Eliminar el plan "${plan.name}"?`)) {
                e.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <form action={formAction} className="border-t border-zinc-100 p-4">
          {state.error && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-zinc-700 sm:col-span-3">
              Nombre
              <input
                type="text"
                name="name"
                required
                defaultValue={plan.name}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Clases por mes
              <input
                type="number"
                name="classesPerMonth"
                required
                min="1"
                defaultValue={plan.classesPerMonth}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Precio ($)
              <input
                type="number"
                name="price"
                min="0"
                step="any"
                defaultValue={plan.price}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isPending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
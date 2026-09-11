"use client";

import { useActionState } from "react";
import Link from "next/link";
import { consultarSocio, type ConsultaResult } from "./actions";

const weights = (amount: number) =>
  amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export default function ConsultaForm() {
  const [state, formAction, isPending] = useActionState<
    ConsultaResult | null,
    FormData
  >(consultarSocio, null);

  return (
    <div className="w-full max-w-md">
      <form
        action={formAction}
        className="flex gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm"
      >
        <input
          type="text"
          name="dni"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ingresá tu DNI"
          className="flex-1 rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "…" : "Buscar"}
        </button>
      </form>

      {state?.ok === false && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
          {state.message}
        </p>
      )}

      {state?.ok && state.client && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-6 py-5 text-center">
            <p className="text-xl font-bold">{state.client.name}</p>
            <p className="text-sm text-zinc-500">
              DNI consultado para su membresía
            </p>
          </div>

          <div
            className={`px-6 py-4 text-white ${
              state.client.status === "vencido"
                ? "bg-red-600"
                : state.client.status === "vence-hoy"
                  ? "bg-amber-500"
                  : "bg-emerald-600"
            }`}
          >
            <p className="text-3xl font-black">
              {state.client.daysLeft >= 0
                ? `${state.client.daysLeft} día${state.client.daysLeft === 1 ? "" : "s"} restantes`
                : `Vencido hace ${Math.abs(state.client.daysLeft)} día${Math.abs(state.client.daysLeft) === 1 ? "" : "s"}`}
            </p>
            <p className="text-sm opacity-90">
              {state.client.status === "al-dia"
                ? "Cuota al día"
                : state.client.status === "vence-hoy"
                  ? "Tu cuota vence hoy"
                  : "Tu cuota está vencida"}
            </p>
          </div>

          <dl className="divide-y divide-zinc-100 px-6 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-zinc-500">Plan</dt>
              <dd className="font-semibold">{state.client.plan ?? "—"}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-zinc-500">Desde</dt>
              <dd>{state.client.startDate}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-zinc-500">Vencimiento</dt>
              <dd className="font-semibold">{state.client.endDate}</dd>
            </div>
          </dl>

          {state.client.payments.length > 0 && (
            <div className="border-t border-zinc-100 px-6 py-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">
                Últimos pagos
              </p>
              <ul className="space-y-1 text-sm text-zinc-700">
                {state.client.payments.map((p, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {p.date} · {p.plan}
                    </span>
                    <span className="font-medium">{weights(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Link
        href="/"
        className="mt-6 block text-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
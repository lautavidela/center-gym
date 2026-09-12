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
          className="min-w-0 flex-1 rounded-xl px-3 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-500 sm:px-4 sm:text-lg"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:px-6"
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
          <div className="px-5 py-5 text-center sm:px-6 sm:py-5">
            <p className="break-words text-lg font-bold sm:text-xl">{state.client.name}</p>
            <p className="text-sm text-zinc-500">
              DNI consultado para su membresía
            </p>
          </div>

          <div
            className={`px-5 py-4 text-white sm:px-6 ${
              state.client.status === "vencido"
                ? "bg-red-600"
                : state.client.status === "vence-hoy"
                  ? "bg-amber-500"
                  : "bg-emerald-600"
            }`}
          >
            <p className="break-words text-2xl font-black sm:text-3xl">
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

          <dl className="divide-y divide-zinc-100 px-5 text-sm sm:px-6">
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Plan</dt>
              <dd className="text-right">
              <span className="font-semibold">{state.client.plan ?? "—"}</span>
              {state.client.planDetail && (
                <span className="block text-xs font-normal text-zinc-500">
                  {state.client.planDetail}
                </span>
              )}
            </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Desde</dt>
              <dd className="text-right">{state.client.startDate}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Vencimiento</dt>
              <dd className="text-right font-semibold">{state.client.endDate}</dd>
            </div>
          </dl>

          {state.client.payments.length > 0 && (
            <div className="border-t border-zinc-100 px-5 py-4 sm:px-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">
                Últimos pagos
              </p>
              <ul className="space-y-1 text-sm text-zinc-700">
                {state.client.payments.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span className="break-words">{p.date} · {p.plan}</span>
                    <span className="shrink-0 font-medium">{weights(p.amount)}</span>
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
"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { consultarSocioGlobal, type ConsultaGlobalResult } from "./actions";
import type { ConsultaView } from "@/lib/consulta";

const weights = (amount: number) =>
  amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

function statusLabel(view: ConsultaView): string {
  if (!view.hasMembership) return "Sin membresía cargada";
  if (view.status === "al-dia") return "Cuota al día";
  if (view.status === "vence-hoy") return "Vence hoy";
  return "Cuota vencida";
}

function ConsultaCard({ view }: { view: ConsultaView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="px-5 py-4 text-center sm:px-6 sm:py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Gimnasio: {view.gymName}
        </p>
        <p className="break-words text-lg font-bold sm:text-xl">
          {view.clientName}
        </p>
        <p className="text-sm text-zinc-500">DNI consultado para su membresía</p>
      </div>

      {!view.hasMembership ? (
        <div className="bg-red-600 px-5 py-4 text-white sm:px-6">
          <p className="text-lg font-bold">
            Todavía no tiene una membresía cargada
          </p>
          <p className="text-sm opacity-90">Consultá con la administración.</p>
        </div>
      ) : (
        <>
          <div
            className={`px-5 py-4 text-white sm:px-6 ${
              view.status === "vencido"
                ? "bg-red-600"
                : view.status === "vence-hoy"
                  ? "bg-amber-500"
                  : "bg-emerald-600"
            }`}
          >
            <p className="break-words text-2xl font-black sm:text-3xl">
              {view.daysLeft! >= 0
                ? `${view.daysLeft} día${view.daysLeft === 1 ? "" : "s"} restantes`
                : `Vencido hace ${Math.abs(view.daysLeft!)} día${Math.abs(view.daysLeft!) === 1 ? "" : "s"}`}
            </p>
            <p className="text-sm opacity-90">
              {view.status === "al-dia"
                ? "Cuota al día"
                : view.status === "vence-hoy"
                  ? "Tu cuota vence hoy"
                  : "Tu cuota está vencida"}
            </p>
          </div>

          <dl className="divide-y divide-zinc-100 px-5 text-sm sm:px-6">
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Plan</dt>
              <dd className="text-right">
                <span className="font-semibold">{view.plan ?? "—"}</span>
                {view.planDetail && (
                  <span className="block text-xs font-normal text-zinc-500">
                    {view.planDetail}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Desde</dt>
              <dd className="text-right">{view.startDate}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Vencimiento</dt>
              <dd className="text-right font-semibold">{view.endDate}</dd>
            </div>
          </dl>
        </>
      )}

      {view.payments.length > 0 && (
        <div className="border-t border-zinc-100 px-5 py-4 sm:px-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">
            Últimos pagos
          </p>
          <ul className="space-y-1 text-sm text-zinc-700">
            {view.payments.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <span className="break-words">
                  {p.date} · {p.plan}
                </span>
                <span className="shrink-0 font-medium">{weights(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ConsultaGlobalForm() {
  const [state, formAction, isPending] = useActionState<
    ConsultaGlobalResult | null,
    FormData
  >(consultarSocioGlobal, null);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);

  const candidate = state?.ok ? state.results[0] : null;
  const selected =
    state?.ok &&
    state.multiple &&
    selectedGymId != null &&
    state.results.some((r) => r.gymId === selectedGymId)
      ? state.results.find((r) => r.gymId === selectedGymId)!
      : null;

  return (
    <div className="w-full max-w-md">
      <form
        action={formAction}
        onSubmit={() => setSelectedGymId(null)}
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
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
          {state.message}
        </div>
      )}

      {state?.ok && !state.multiple && candidate && (
        <div className="mt-4">
          <ConsultaCard view={candidate} />
        </div>
      )}

      {state?.ok && state.multiple && !selected && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-center text-sm text-zinc-600">
            Estás registrado en más de un gimnasio.
            <span className="mt-0.5 block text-xs font-bold uppercase tracking-wide text-zinc-400">
              ¿Cuál querés consultar?
            </span>
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {state.results.map((r) => (
              <button
                key={r.gymId}
                type="button"
                onClick={() => setSelectedGymId(r.gymId)}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="font-semibold">{r.gymName}</span>
                <span
                  className={`shrink-0 text-xs font-semibold ${
                    r.status === "al-dia"
                      ? "text-emerald-600"
                      : r.status === "vence-hoy"
                        ? "text-amber-600"
                        : r.hasMembership
                          ? "text-red-600"
                          : "text-zinc-400"
                  }`}
                >
                  {statusLabel(r)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setSelectedGymId(null)}
            className="mb-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ← Elegir otro gimnasio
          </button>
          <ConsultaCard view={selected} />
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
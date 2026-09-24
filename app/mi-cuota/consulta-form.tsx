"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { buscarSocioGlobal } from "@/app/actions/cliente-pin";
import ConsultaResult from "@/components/consulta-result";

export default function ConsultaGlobalForm() {
  const [dni, setDni] = useState("");
  const [result, setResult] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; message: string }
    | {
        status: "gyms";
        gyms: {
          gymId: number;
          gymName: string;
          hasPin: boolean;
          clientName: string;
        }[];
      }
  >({ status: "idle" });
  const [selected, setSelected] = useState<{
    gymId: number;
    gymName: string;
    hasPin: boolean;
    clientName: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    const raw = String(formData.get("dni") ?? "").trim().replace(/\D/g, "");
    if (raw.length < 6) {
      setResult({ status: "error", message: "Ingresá un DNI válido." });
      return;
    }
    setDni(raw);
    setSelected(null);
    setResult({ status: "loading" });
    startTransition(async () => {
      const res = await buscarSocioGlobal(raw);
      if (!res.ok) {
        setResult({ status: "error", message: res.message });
        return;
      }
      setResult({ status: "gyms", gyms: res.gyms });
    });
  };

  return (
    <div className="w-full max-w-md">
      {result.status !== "gyms" && !selected && (
        <form
          action={submit}
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
      )}

      {result.status === "error" && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
          {result.message}
        </div>
      )}

      {result.status === "gyms" && !selected && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setResult({ status: "idle" })}
            className="mb-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ← Cambiar DNI
          </button>
          <p className="text-center text-sm text-zinc-600">
            {result.gyms.length === 1
              ? `Socio encontrado en ${result.gyms[0].gymName}.`
              : "Estás registrado en más de un gimnasio."}
            <span className="mt-0.5 block text-xs font-bold uppercase tracking-wide text-zinc-400">
              {result.gyms.length === 1
                ? "Elegí para continuar"
                : "¿Cuál querés consultar?"}
            </span>
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {result.gyms.map((g) => (
              <button
                key={g.gymId}
                type="button"
                onClick={() => setSelected({ ...g })}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="font-semibold">{g.gymName}</span>
                <span className="shrink-0 text-xs font-semibold text-zinc-400">
                  {g.hasPin ? "tengo PIN" : "crear PIN"} →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <ConsultaResult
          gymId={selected.gymId}
          gymName={selected.gymName}
          dni={dni}
          clientName={selected.clientName}
          hasPin={selected.hasPin}
          onReset={() => setSelected(null)}
        />
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
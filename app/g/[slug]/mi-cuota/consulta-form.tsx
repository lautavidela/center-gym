"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { buscarSocio } from "@/app/actions/cliente-pin";
import ConsultaResult from "@/components/consulta-result";

export default function ConsultaForm({
  gymId,
  gymName,
}: {
  gymId: number;
  gymName: string;
}) {
  const [dni, setDni] = useState("");
  const [result, setResult] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "found"; hasPin: boolean; clientName: string }
  >({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    const raw = String(formData.get("dni") ?? "").trim().replace(/\D/g, "");
    if (raw.length < 6) {
      setResult({ status: "error", message: "Ingresá un DNI válido." });
      return;
    }
    setDni(raw);
    setResult({ status: "loading" });
    startTransition(async () => {
      const res = await buscarSocio(gymId, raw);
      if (!res.ok) {
        setResult({ status: "error", message: res.message });
        return;
      }
      setResult({ status: "found", hasPin: res.hasPin, clientName: res.name });
    });
  };

  return (
    <div className="w-full max-w-md">
      {result.status !== "found" && (
        <form
          action={submit}
          className="flex gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm"
        >
          <input type="hidden" name="gymId" value={gymId} />
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
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
          {result.message}
        </p>
      )}

      {result.status === "found" && (
        <ConsultaResult
          gymId={gymId}
          gymName={gymName}
          dni={dni}
          clientName={result.clientName}
          hasPin={result.hasPin}
          onReset={() => setResult({ status: "idle" })}
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
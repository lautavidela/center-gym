"use client";

import { useState } from "react";
import type { ClientStatus } from "@/lib/status";
import RegisterButton from "./register-button";

type SearchResult = {
  id: number;
  name: string;
  dni: string | null;
  phone: string | null;
  status: ClientStatus;
  plan: string | null;
  endDate: string | null;
  alreadyToday: boolean;
};

export default function AttendanceRegister() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function search(q: string) {
    setQuery(q);
    setMessage(null);
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setMessage("No autorizado.");
        setResults(null);
        return;
      }
      const data = (await res.json()) as { clients: SearchResult[] };
      setResults(data.clients);
      if (data.clients.length === 0) setMessage("Sin resultados.");
    } catch {
      setMessage("Error al buscar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Registrar asistencia</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Buscá por nombre o DNI y marcá la entrada.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Nombre o DNI…"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {loading && <p className="mt-3 text-sm text-zinc-500">Buscando…</p>}
      {message && (
        <p className="mt-3 text-sm text-zinc-500">{message}</p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-100">
          {results.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-zinc-500">
                  {c.dni ? `DNI ${c.dni}` : "Sin DNI"}
                  {c.plan ? ` · ${c.plan}${c.endDate ? ` · vence ${c.endDate}` : ""}` : " · sin plan"}
                </p>
              </div>
              <RegisterButton
                clientId={c.id}
                clientName={c.name}
                alreadyToday={c.alreadyToday}
                suspended={c.status === "suspendido"}
                vencido={c.status === "vencido"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  agregarEjercicio,
  editarEjercicio,
  moverEjercicio,
  quitarEjercicio,
  type RoutineItemClient,
} from "@/app/actions/cliente-rutina";
import { DAYS } from "@/lib/routines";

type ExItem = RoutineItemClient["exercise"];

type Props = {
  gymId: number;
  dni: string;
  pin: string;
  initial: RoutineItemClient[];
  onExit: () => void;
};

export default function RoutineSelfEditor({
  gymId,
  dni,
  pin,
  initial,
  onExit,
}: Props) {
  const [items, setItems] = useState<RoutineItemClient[]>(initial);
  const [activeDay, setActiveDay] = useState<number>(() =>
    initial[0] ? initial[0].day : 0
  );
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ExItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<number, RoutineItemClient[]>();
    for (const r of items) {
      const arr = map.get(r.day) ?? [];
      arr.push(r);
      map.set(r.day, arr);
    }
    return map;
  }, [items]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = search.trim();
    debounceRef.current = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/exercises/public?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.exercises ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const current = byDay.get(activeDay) ?? [];
  const dayHas = (exerciseId: string, day: number) =>
    (byDay.get(day) ?? []).some((r) => r.exercise.id === exerciseId);

  const applyAction = (fn: () => Promise<{ ok: boolean; message?: string; routine?: RoutineItemClient[] }>) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.message ?? "Algo salió mal.");
        return;
      }
      if (res.routine) setItems(res.routine);
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 p-3">
        <p className="text-sm font-semibold text-zinc-700">
          Editando mi rutina
        </p>
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
        >
          Listo
        </button>
      </div>

      <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-zinc-100 p-2">
        {DAYS.map((label, d) => {
          const count = (byDay.get(d) ?? []).length;
          const active = d === activeDay;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(d)}
              className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {label}
              <span
                className={`text-xs font-normal ${
                  active ? "text-emerald-100" : "text-zinc-400"
                }`}
              >
                {count === 0 ? "vacío" : `${count} ${count === 1 ? "ejercicio" : "ejercicios"}`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {current.length === 0 ? (
          <p className="mb-4 text-sm text-zinc-500">
            Todavía no tenés ejercicios para los{" "}
            <span className="font-semibold">{DAYS[activeDay].toLowerCase()}</span>.
          </p>
        ) : (
          <ol className="mb-4 space-y-3">
            {current.map((r, i) => (
              <li
                key={r.id}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
              >
                <img
                  src={r.exercise.gifUrl}
                  alt={r.exercise.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold leading-tight">
                      {i + 1}. {r.exercise.name}
                    </span>
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                      {r.exercise.muscle ?? "—"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {r.sets} series × {r.reps} reps · descanso {r.rest}s
                    {r.exercise.equipment ? ` · ${r.exercise.equipment}` : ""}
                  </p>
                  {r.notes && (
                    <p className="mt-0.5 text-xs text-zinc-600">{r.notes}</p>
                  )}

                  {editingId === r.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        applyAction(() =>
                          editarEjercicio(gymId, dni, pin, r.id, {
                            sets: Number(fd.get("sets")),
                            reps: String(fd.get("reps") ?? ""),
                            rest: String(fd.get("rest") ?? ""),
                            notes: String(fd.get("notes") ?? ""),
                          })
                        );
                        setEditingId(null);
                      }}
                      className="mt-2 grid grid-cols-3 gap-2"
                    >
                      <label className="text-xs font-medium text-zinc-500">
                        Series
                        <input
                          name="sets"
                          type="number"
                          min={1}
                          defaultValue={r.sets}
                          className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-zinc-500">
                        Reps
                        <input
                          name="reps"
                          type="text"
                          defaultValue={r.reps}
                          className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-zinc-500">
                        Descanso (s)
                        <input
                          name="rest"
                          type="text"
                          defaultValue={r.rest}
                          className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="col-span-3 text-xs font-medium text-zinc-500">
                        Notas (opcional)
                        <input
                          name="notes"
                          type="text"
                          defaultValue={r.notes ?? ""}
                          className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </label>
                      <div className="col-span-3 flex gap-2">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(r.id)}
                        className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={i === 0 || isPending}
                        onClick={() =>
                          applyAction(() => moverEjercicio(gymId, dni, pin, r.id, "up"))
                        }
                        className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === current.length - 1 || isPending}
                        onClick={() =>
                          applyAction(() => moverEjercicio(gymId, dni, pin, r.id, "down"))
                        }
                        className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `¿Quitar "${r.exercise.name}" de ${DAYS[activeDay]}?`
                            )
                          ) {
                            applyAction(() =>
                              quitarEjercicio(gymId, dni, pin, r.id)
                            );
                          }
                        }}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="border-t border-zinc-200 pt-4">
          <p className="mb-2 text-sm font-semibold text-zinc-700">
            Agregar ejercicio a los{" "}
            <span className="text-emerald-700">
              {DAYS[activeDay].toLowerCase()}
            </span>
          </p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscá por nombre, músculo o equipo…"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searching && <p className="mt-2 text-xs text-zinc-500">Buscando…</p>}
          {!searching && results.length > 0 && (
            <ul className="mt-2 space-y-1">
              {results.map((ex) => {
                const alreadyHere = dayHas(ex.id, activeDay);
                const elsewhere: number[] = [];
                for (let d = 0; d < 7; d++) {
                  if (d !== activeDay && dayHas(ex.id, d)) elsewhere.push(d);
                }
                const elsewhereText =
                  elsewhere.length > 0
                    ? elsewhere
                        .sort((a, b) => a - b)
                        .map((d) => DAYS[d])
                        .join(", ")
                    : null;
                return (
                  <li
                    key={ex.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                      alreadyHere
                        ? "border-zinc-100 bg-zinc-50 text-zinc-400"
                        : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <img
                      src={ex.gifUrl}
                      alt={ex.name}
                      width={36}
                      height={36}
                      loading="lazy"
                      className={`rounded object-cover ${
                        alreadyHere ? "opacity-40" : ""
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ex.name}</p>
                      <p className="text-xs text-zinc-500">
                        {ex.muscle ?? ""}
                        {ex.equipment ? ` · ${ex.equipment}` : ""}
                        {elsewhereText ? (
                          <span className="text-amber-600">
                            {" "}
                            · ya está el {elsewhereText}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isPending || alreadyHere}
                      onClick={() =>
                        applyAction(() =>
                          agregarEjercicio(gymId, dni, pin, ex.id, activeDay)
                        )
                      }
                      className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {alreadyHere ? "Ya está" : "Agregar"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!searching && search.trim().length >= 2 && results.length === 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              Sin resultados para “{search.trim()}”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
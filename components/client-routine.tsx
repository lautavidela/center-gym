"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  addRoutineExercise,
  moveRoutineExercise,
  removeRoutineExercise,
  updateRoutineExercise,
} from "@/app/admin/actions/routines";

export type RoutineItem = {
  id: number;
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string | null;
  order: number;
  exercise: {
    name: string;
    muscle: string | null;
    bodyPart: string | null;
    equipment: string | null;
    gifUrl: string;
  };
};

export type SearchResultExercise = {
  id: string;
  name: string;
  muscle: string | null;
  bodyPart: string | null;
  equipment: string | null;
  gifUrl: string;
};

export default function ClientRoutine({
  clientId,
  initialRoutines,
}: {
  clientId: number;
  initialRoutines: RoutineItem[];
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResultExercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routines = initialRoutines;

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
        const res = await fetch(`/api/exercises?q=${encodeURIComponent(q)}`);
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

  const sync = (isPending: boolean) => {
    if (!isPending) {
      window.location.reload();
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-bold">Rutina del socio</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Armá la rutina que {routines.length > 0 ? "el socio" : "verá el socio"} en su consulta por DNI.
      </p>

      {routines.length === 0 ? (
        <p className="mb-4 text-sm text-zinc-500">
          Todavía no tiene ejercicios asignados.
        </p>
      ) : (
        <ol className="mb-4 space-y-3">
          {routines.map((r, i) => (
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
                {r.notes && <p className="mt-0.5 text-xs text-zinc-600">{r.notes}</p>}

                {editingId === r.id ? (
                  <form
                    action={async (formData) => {
                      startTransition(async () => {
                        await updateRoutineExercise(r.id, {
                          sets: Number(formData.get("sets")),
                          reps: String(formData.get("reps") ?? ""),
                          rest: String(formData.get("rest") ?? ""),
                          notes: String(formData.get("notes") ?? ""),
                        });
                        setEditingId(null);
                        sync(false);
                      });
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
                        startTransition(async () => {
                          await moveRoutineExercise(r.id, "up");
                          sync(false);
                        })
                      }
                      className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === routines.length - 1 || isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await moveRoutineExercise(r.id, "down");
                          sync(false);
                        })
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
                          confirm(`¿Quitar "${r.exercise.name}" de la rutina?`)
                        ) {
                          startTransition(async () => {
                            await removeRoutineExercise(r.id);
                            sync(false);
                          });
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
          Agregar ejercicio
        </p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscá por nombre, músculo o equipo…"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {searching && (
          <p className="mt-2 text-xs text-zinc-500">Buscando…</p>
        )}
        {!searching && results.length > 0 && (
          <ul className="mt-2 space-y-1">
            {results.map((ex) =>
              routines.some((r) => r.exerciseId === ex.id) ? (
                <li
                  key={ex.id}
                  className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"
                >
                  <img
                    src={ex.gifUrl}
                    alt={ex.name}
                    width={36}
                    height={36}
                    loading="lazy"
                    className="rounded object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {ex.name}
                  </span>
                  <span className="text-xs text-emerald-600">Ya está en la rutina</span>
                </li>
              ) : (
                <li
                  key={ex.id}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <img
                    src={ex.gifUrl}
                    alt={ex.name}
                    width={36}
                    height={36}
                    loading="lazy"
                    className="rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ex.name}</p>
                    <p className="text-xs text-zinc-500">
                      {ex.muscle ?? ""}
                      {ex.equipment ? ` · ${ex.equipment}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await addRoutineExercise(clientId, ex.id);
                        sync(false);
                      })
                    }
                    className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </li>
              )
            )}
          </ul>
        )}
        {!searching && search.trim().length >= 2 && results.length === 0 && (
          <p className="mt-2 text-xs text-zinc-500">
            Sin resultados para “{search.trim()}”.
          </p>
        )}
      </div>
    </section>
  );
}
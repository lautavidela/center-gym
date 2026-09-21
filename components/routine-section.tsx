"use client";

import { useEffect, useState } from "react";

export const ROUTINE_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export type RoutineExerciseView = {
  day: number;
  name: string;
  gifUrl: string;
  muscle: string | null;
  bodyPart: string | null;
  equipment: string | null;
  sets: number;
  reps: string;
  rest: string;
  notes: string | null;
};

export default function RoutineSection({
  routine,
}: {
  routine: RoutineExerciseView[];
}) {
  const [lightbox, setLightbox] = useState<RoutineExerciseView | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (routine.length === 0) return null;

  const byDay = ROUTINE_DAYS.map((label, day) => ({
    label,
    items: routine.filter((r) => r.day === day),
  })).filter((d) => d.items.length > 0);

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-center text-xl font-bold text-zinc-800">
        Tu rutina
      </h2>
      <p className="mb-4 -mt-2 text-center text-sm text-zinc-500">
        Tocá el ejercicio para ver cómo se hace en grande.
      </p>

      {byDay.map((d) => (
        <div key={d.label} className="mb-6">
          <h3 className="mb-2 flex items-center gap-2">
            <span className="inline-block rounded-lg bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
              {d.label}
            </span>
            <span className="text-sm text-zinc-400">
              {d.items.length} ejercicio{d.items.length === 1 ? "" : "s"}
            </span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {d.items.map((r, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setLightbox(r)}
                  className="block w-full cursor-zoom-in bg-zinc-900"
                  aria-label={`Ver ${r.name} en grande`}
                >
                  <img
                    src={r.gifUrl}
                    alt={r.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
                <div className="p-4">
                  <p className="font-bold leading-tight text-zinc-800">
                    {i + 1}. {r.name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    <span className="font-semibold text-emerald-700">
                      {r.sets} series × {r.reps} reps
                    </span>{" "}
                    · descanso {r.rest}s
                  </p>
                  <p className="text-xs text-zinc-400">
                    {[r.bodyPart, r.muscle, r.equipment]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {r.notes && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      {r.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.name} en grande`}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div
            className="max-h-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.gifUrl}
              alt={lightbox.name}
              className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain"
            />
            <p className="mt-4 text-center text-white">
              <span className="font-bold">{lightbox.name}</span>
              <span className="mt-1 block text-sm opacity-80">
                {lightbox.sets} series × {lightbox.reps} reps · descanso{" "}
                {lightbox.rest}s
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
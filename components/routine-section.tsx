export type RoutineExerciseView = {
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
  if (routine.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-center text-lg font-bold text-zinc-800">
        Tu rutina
      </h2>
      <div className="space-y-3">
        {routine.map((r, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
          >
            <img
              src={r.gifUrl}
              alt={r.name}
              width={64}
              height={64}
              loading="lazy"
              className="shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold leading-tight text-zinc-800">
                {i + 1}. {r.name}
              </p>
              <p className="text-xs text-zinc-500">
                {r.sets} series × {r.reps} reps · descanso {r.rest}s
                {r.equipment ? ` · ${r.equipment}` : ""}
                {r.bodyPart || r.muscle ? ` · ${r.bodyPart ?? ""}${r.bodyPart && r.muscle && r.muscle !== r.bodyPart ? ` / ${r.muscle}` : ""}` : ""}
              </p>
              {r.notes && (
                <p className="mt-1 text-xs text-zinc-600">{r.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
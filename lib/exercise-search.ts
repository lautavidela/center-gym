import { prisma } from "@/lib/prisma";

export type SearchExercise = {
  id: string;
  name: string;
  muscle: string | null;
  bodyPart: string | null;
  equipment: string | null;
  gifUrl: string;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function wordSet(s: string): Set<string> {
  return new Set(s.split(" ").filter((w) => w.length >= 3));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

const GROUPS: string[][] = [
  [
    "pecho",
    "pectoral",
    "pectorales",
    "pectorals",
    "chest",
    "pecs",
    "banco plano",
    "press de banca",
  ],
  [
    "espalda",
    "dorsal",
    "dorsales",
    "dorsal",
    "lats",
    "back",
    "upper-back",
    "upper back",
  ],
  ["hombro", "hombros", "deltoides", "delts", "deltoid", "shoulder", "shoulders"],
  ["brazo", "brazos", "arm", "arms"],
  ["pierna", "piernas", "leg", "legs"],
  ["cuadriceps", "cuadricep", "cuadriceps", "quad", "quads", "thigh", "thighs"],
  [
    "femoral",
    "femorales",
    "hamstring",
    "hamstrings",
    "isquiotibiales",
    "isquios",
    "isquio",
  ],
  ["gluteo", "gluteos", "glutes", "glute", "gluteus", "gluteos"],
  ["gemelo", "gemelos", "calf", "calves"],
  ["bicep", "biceps", "bicep"],
  ["tricep", "triceps", "triceps"],
  ["antebrazo", "antebrazos", "forearm", "forearms"],
  ["abdomen", "abdominal", "abdominales", "abs", "core", "abdominals"],
  ["abductor", "abductores", "abductors"],
  ["adductor", "adductores", "adductors"],
  ["serrato", "serratus", "serratus-anterior", "serratus anterior"],
  ["columna", "espina", "espinal", "spine"],
  ["cardio", "cardiovascular"],
  ["barra", "barbell", "bar"],
  ["mancuerna", "mancuernas", "dumbbell", "dumbbells", "db"],
  ["polea", "poleas", "cable", "cables", "crossover", "crossovers"],
  ["maquina", "maquinas", "machine", "machines", "lever"],
  ["banda", "bandas", "band", "bands", "elastico", "elastica"],
  ["peso", "pesos", "weight", "weights"],
  ["kettlebell", "kettlebells", "mancuerna rusa"],
  ["smith", "smith machine", "maquina smith"],
  ["ez", "ez-bar", "ez bar"],
  ["banco", "banca", "banquet", "bench"],
  ["plano", "plana", "planos", "flat"],
  ["declinado", "declinada", "declinados", "decline"],
  ["inclinado", "inclinada", "inclinados", "incline"],
  ["sentadilla", "sentadillas", "squat", "squats"],
  ["remo", "remos", "row", "rows"],
  ["curl", "curls"],
  ["dominada", "dominadas", "pull-up", "pull-ups", "pull up", "chin-up", "chinup"],
  ["flexion", "flexiones", "push-up", "push-ups", "push up", "pushup", "pushups"],
  ["apertura", "aperturas", "fly", "flies"],
  ["peso muerto", "deadlift", "deadlifts"],
  ["press", "presion", "empuje", "press"],
  ["elevacion", "elevaciones", "elevation", "elevations", "raise", "raises"],
  ["tiron", "tirones", "pull", "tiradas"],
];

const SYNONYMS: Record<string, string[]> = {};
for (const group of GROUPS) {
  for (const term of group) {
    const key = normalize(term);
    if (!key) continue;
    if (!SYNONYMS[key]) SYNONYMS[key] = [];
    for (const other of group) {
      const value = normalize(other);
      if (value && !SYNONYMS[key].includes(value)) SYNONYMS[key].push(value);
    }
  }
}
for (const key of Object.keys(SYNONYMS)) SYNONYMS[key].push(key);

function variantsOf(token: string): string[] {
  return SYNONYMS[token] ?? [token];
}

type ExerciseRow = {
  id: string;
  name: string;
  muscle: string | null;
  bodyPart: string | null;
  equipment: string | null;
  gifUrl: string;
};

function scoreExercise(ex: ExerciseRow, tokens: string[]): number {
  const name = normalize(ex.name);
  const nameWords = wordSet(name);
  const meta = normalize(`${ex.muscle ?? ""} ${ex.bodyPart ?? ""} ${ex.equipment ?? ""}`);

  let score = 0;
  let matched = 0;

  for (const token of tokens) {
    let best = 0;
    for (const v of variantsOf(token)) {
      if (nameWords.has(v)) {
        best = Math.max(best, 4);
        continue;
      }
      if (v.length >= 3 && name.includes(v)) {
        best = Math.max(best, 3);
        continue;
      }
      if (v.length >= 3 && meta.includes(v)) {
        best = Math.max(best, 3);
        continue;
      }
      if (best >= 3) continue;
      for (const w of nameWords) {
        const delta = w.length - v.length;
        if (delta < -2 || delta > 2) continue;
        const d = levenshtein(w, v);
        if (d === 1) best = Math.max(best, 3);
        else if (d === 2 && v.length >= 4) best = Math.max(best, 2);
        if (best >= 3) break;
      }
    }
    if (best > 0) matched++;
    score += best;
  }

  const coverage = matched / tokens.length;
  if (coverage < 0.5) return 0;

  score = score * (0.4 + 0.6 * coverage);
  if (nameWords.size <= 3) score += 1.5;
  score -= Math.max(0, nameWords.size - 6) * 0.2;

  return score;
}

export async function searchExercises(rawQuery: string, take = 10): Promise<SearchExercise[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  const tokens = normalize(query)
    .split(" ")
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const all = await prisma.exercise.findMany({
    select: {
      id: true,
      name: true,
      muscle: true,
      bodyPart: true,
      equipment: true,
      gifUrl: true,
    },
  });

  const scored = all
    .map((ex) => ({ ex, score: scoreExercise(ex as unknown as ExerciseRow, tokens) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, take).map((s) => s.ex);
}
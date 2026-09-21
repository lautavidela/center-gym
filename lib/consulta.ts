import type { Client, Exercise, Gym, Membership, Payment, Plan, RoutineExercise } from "@prisma/client";
import { daysUntil, formatDate, startOfDay } from "@/lib/dates";
import { formatClassesLabel } from "@/lib/plans";

export type ClientWithDetails = Client & {
  gym: Gym;
  memberships: (Membership & { plan: Plan | null })[];
  payments: (Payment & { plan: Plan | null })[];
  routineExercises: (RoutineExercise & { exercise: Exercise })[];
};

export const activeMembershipsArgs = {
  where: { isActive: true },
  orderBy: { endDate: "desc" },
  take: 1,
  include: { plan: true },
} as const;

export const recentPaymentsArgs = {
  orderBy: { paidAt: "desc" },
  take: 5,
  include: { plan: true },
} as const;

export const clientRoutineArgs = {
  orderBy: [{ day: "asc" as const }, { order: "asc" as const }],
  include: { exercise: true },
};

export type ConsultaView = {
  gymId: number;
  gymName: string;
  gymSlug: string;
  clientName: string;
  phone: string | null;
  hasMembership: boolean;
  plan: string | null;
  planDetail: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "al-dia" | "vence-hoy" | "vencido" | null;
  daysLeft: number | null;
  payments: {
    date: string;
    plan: string;
    amount: number;
    method: string;
  }[];
  routine: {
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
  }[];
};

export function buildConsultaView(client: ClientWithDetails): ConsultaView {
  const membership = client.memberships[0];

  const base = {
    gymId: client.gym.id,
    gymName: client.gym.name,
    gymSlug: client.gym.slug,
    clientName: client.name,
    phone: client.phone,
    hasMembership: !!membership,
    routine: client.routineExercises.map((r) => ({
      day: r.day,
      name: r.exercise.name,
      gifUrl: r.exercise.gifUrl,
      muscle: r.exercise.muscle,
      bodyPart: r.exercise.bodyPart,
      equipment: r.exercise.equipment,
      sets: r.sets,
      reps: r.reps,
      rest: r.rest,
      notes: r.notes,
    })),
    payments: client.payments.map((p) => ({
      date: formatDate(p.paidAt),
      plan: p.plan?.name ?? "—",
      amount: p.amount,
      method: p.method,
    })),
  };

  if (!membership) {
    return {
      ...base,
      plan: null,
      planDetail: null,
      startDate: null,
      endDate: null,
      status: null,
      daysLeft: null,
    };
  }

  const today = startOfDay(new Date());
  const daysLeft = daysUntil(today, membership.endDate);
  const status: "al-dia" | "vence-hoy" | "vencido" =
    daysLeft > 0 ? "al-dia" : daysLeft === 0 ? "vence-hoy" : "vencido";

  return {
    ...base,
    plan: membership.plan?.name ?? null,
    planDetail: membership.plan
      ? formatClassesLabel(membership.plan.classesPerMonth)
      : null,
    startDate: formatDate(membership.startDate),
    endDate: formatDate(membership.endDate),
    status,
    daysLeft,
  };
}
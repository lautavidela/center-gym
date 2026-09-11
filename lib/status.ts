import { daysUntil } from "./dates";

export type ClientStatus =
  | "al-dia"
  | "vence-pronto"
  | "vence-hoy"
  | "vencido"
  | "sin-membresia"
  | "suspendido";

export function computeStatus(
  endDate: Date | null | undefined,
  isSuspended: boolean
): ClientStatus {
  if (isSuspended) return "suspendido";
  if (!endDate) return "sin-membresia";
  const days = daysUntil(new Date(), endDate);
  if (days < 0) return "vencido";
  if (days === 0) return "vence-hoy";
  if (days <= 7) return "vence-pronto";
  return "al-dia";
}
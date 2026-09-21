export const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function isValidDay(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}
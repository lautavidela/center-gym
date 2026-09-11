import { formatMoney } from "./dates";

export function formatClassesLabel(classesPerMonth: number): string {
  return `${classesPerMonth} clase${classesPerMonth === 1 ? "" : "s"}/mes`;
}

export function formatPlanOption(plan: {
  name: string;
  classesPerMonth: number;
  price: number;
}): string {
  return `${plan.name} · ${formatClassesLabel(plan.classesPerMonth)} · ${formatMoney(plan.price)}`;
}
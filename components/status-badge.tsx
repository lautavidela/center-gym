import type { ClientStatus } from "@/lib/status";

const config: Record<ClientStatus, { label: string; cls: string }> = {
  "al-dia": { label: "Al día", cls: "bg-emerald-100 text-emerald-700" },
  "vence-pronto": { label: "Vence pronto", cls: "bg-amber-100 text-amber-700" },
  "vence-hoy": { label: "Vence hoy", cls: "bg-orange-100 text-orange-700" },
  vencido: { label: "Vencido", cls: "bg-red-100 text-red-700" },
  "sin-membresia": { label: "Sin membresía", cls: "bg-zinc-100 text-zinc-600" },
  suspendido: { label: "Suspendido", cls: "bg-zinc-200 text-zinc-700" },
};

export default function StatusBadge({ status }: { status: ClientStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.cls}`}
    >
      {c.label}
    </span>
  );
}
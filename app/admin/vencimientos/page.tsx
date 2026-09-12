import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { activeMembershipInclude, type ClientWithMembership } from "@/lib/membership";
import { daysUntil, formatDate, startOfDay } from "@/lib/dates";
import StatusBadge from "@/components/status-badge";
import QuickPayForm from "@/components/quick-pay-form";

export const metadata: Metadata = {
  title: "Vencimientos",
};

const tabs = [
  { f: "7", label: "Vencen en 7 días" },
  { f: "30", label: "Vencen en 30 días" },
  { f: "vencidos", label: "Vencidos" },
  { f: "todos", label: "Todos" },
];

type Row = {
  client: ClientWithMembership;
  membership: NonNullable<ClientWithMembership["memberships"]>[number];
  until: number;
};

export default async function VencimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f = "7" } = await searchParams;
  const today = startOfDay(new Date());

  const clients = await prisma.client.findMany({
    include: activeMembershipInclude,
  });

  const plans = await prisma.plan.findMany({ where: { isActive: true } });

  const rows: Row[] = [];
  for (const client of clients) {
    const m = client.memberships[0];
    if (!m || client.isSuspended) continue;
    rows.push({
      client,
      membership: m,
      until: daysUntil(today, m.endDate),
    });
  }

  let filtered: Row[];
  if (f === "vencidos") {
    filtered = rows
      .filter((r) => r.until < 0)
      .sort((a, b) => b.until - a.until);
  } else if (f === "30") {
    filtered = rows
      .filter((r) => r.until >= 0 && r.until <= 30)
      .sort((a, b) => a.until - b.until);
  } else if (f === "todos") {
    filtered = rows.sort((a, b) => a.until - b.until);
  } else {
    filtered = rows
      .filter((r) => r.until >= 0 && r.until <= 7)
      .sort((a, b) => a.until - b.until);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-black sm:text-2xl">Vencimientos</h1>
        <p className="text-sm text-zinc-500">
          Quiénes están al día, quiénes vencen y quiénes deben.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = f === t.f;
          return (
            <Link
              key={t.f}
              href={`/admin/vencimientos?f=${t.f}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-3 border-b border-zinc-100 px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400 md:grid">
          <span>Socio</span>
          <span className="w-28">Plan</span>
          <span className="w-32">Vencimiento</span>
          <span className="w-24">Estado</span>
          <span className="w-52">Cobro rápido</span>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-zinc-500">
            No hay socios en esta categoría.
          </p>
        ) : (
          filtered.map((r) => {
            const m = r.membership;
            const status =
              r.until < 0
                ? "vencido"
                : r.until === 0
                  ? "vence-hoy"
                  : r.until <= 7
                    ? "vence-pronto"
                    : "al-dia";
            return (
              <div
                key={r.client.id}
                className="grid grid-cols-1 gap-3 border-b border-zinc-100 px-5 py-4 last:border-0 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/clientes/${r.client.id}`}
                    className="font-semibold hover:text-red-700"
                  >
                    {r.client.name}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {r.client.dni ? `DNI ${r.client.dni}` : "Sin DNI"}
                  </p>
                </div>
                <div className="text-sm text-zinc-600 md:w-28">
                  {m.plan?.name ?? "—"}
                </div>
                <div className="text-sm md:w-32">
                  <span
                    className={
                      r.until < 0
                        ? "font-semibold text-red-600"
                        : r.until <= 7
                          ? "font-semibold text-amber-600"
                          : ""
                    }
                  >
                    {formatDate(m.endDate)}
                    <span className="ml-1 text-xs text-zinc-400">
                      {r.until < 0
                        ? `(-${Math.abs(r.until)}d)`
                        : r.until === 0
                          ? "(hoy)"
                          : `(${r.until}d)`}
                    </span>
                  </span>
                </div>
                <div className="md:w-24">
                  <StatusBadge status={status} />
                </div>
                <div className="md:w-52">
                  {plans.length > 0 ? (
                    <QuickPayForm
                      clientId={r.client.id}
                      plans={plans}
                      defaultPlanId={m.planId}
                    />
                  ) : (
                    <span className="text-xs text-zinc-400">
                      Sin planes activos
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
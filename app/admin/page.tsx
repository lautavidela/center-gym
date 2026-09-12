import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { activeMembershipInclude, type ClientWithMembership } from "@/lib/membership";
import { daysUntil, formatDate, startOfDay, toDateKey } from "@/lib/dates";
import StatusBadge from "@/components/status-badge";
import { computeStatus, type ClientStatus } from "@/lib/status";

type Row = {
  client: ClientWithMembership;
  membership: NonNullable<ClientWithMembership["memberships"]>[number];
  status: ClientStatus;
  until: number;
};

function StatCard({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: number | string;
  tone: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black sm:text-3xl">{value}</p>
    </>
  );
  const cls = `rounded-2xl border p-5 shadow-sm ${tone}`;
  if (href) {
    return (
      <Link href={href} className={`${cls} block transition hover:shadow-md`}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export default async function DashboardPage() {
  const now = new Date();
  const today = startOfDay(now);

  const [clients, attendanceToday] = await Promise.all([
    prisma.client.findMany({
      include: activeMembershipInclude,
      orderBy: { name: "asc" },
    }),
    prisma.attendance.count({ where: { day: toDateKey(today) } }),
  ]);

  const rows: Row[] = [];
  for (const client of clients) {
    const m = client.memberships[0];
    if (!m || client.isSuspended) continue;
    rows.push({
      client,
      membership: m,
      status: computeStatus(m.endDate, false),
      until: daysUntil(today, m.endDate),
    });
  }

  const active = rows.filter((r) => r.until >= 0).length;
  const in7Count = rows.filter((r) => r.until >= 0 && r.until <= 7).length;
  const in30Count = rows.filter((r) => r.until >= 0 && r.until <= 30).length;
  const expired = rows.filter((r) => r.until < 0);

  const upcoming = rows
    .filter((r) => r.until >= 0 && r.until <= 7)
    .sort((a, b) => a.until - b.until)
    .slice(0, 8);
  const expiredRecent = [...expired]
    .sort((a, b) => b.until - a.until)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black sm:text-2xl">Panel</h1>
          <p className="text-sm text-zinc-500">
            {formatDate(now)} · Bienvenido al gimnasio
          </p>
        </div>
        <Link
          href="/admin/ingresos"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Ingresos →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Socios al día"
          value={active}
          tone="border-emerald-200 bg-emerald-50"
          href="/admin/clientes"
        />
        <StatCard
          label="Vencen en 7 días"
          value={in7Count}
          tone="border-amber-200 bg-amber-50"
          href="/admin/vencimientos?f=7"
        />
        <StatCard
          label="Vencen en 30 días"
          value={in30Count}
          tone="border-blue-200 bg-blue-50"
          href="/admin/vencimientos?f=30"
        />
        <StatCard
          label="Vencidos"
          value={expired.length}
          tone="border-red-200 bg-red-50"
          href="/admin/vencimientos?f=vencidos"
        />
        <StatCard
          label="Asistencias hoy"
          value={attendanceToday}
          tone="border-zinc-200 bg-white"
          href="/admin/asistencias"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="font-bold">Próximos a vencer</h2>
            <Link
              href="/admin/vencimientos?f=7"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Ver todos →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500">
              Nadie vence en los próximos 7 días.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcoming.map((r) => (
                <li key={r.client.id}>
                  <Link
                    href={`/admin/clientes/${r.client.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.client.name}</p>
                      <p className="text-xs text-zinc-500">
                        {r.membership.plan?.name ?? "Sin plan"} · vence{" "}
                        {formatDate(r.membership.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold ${
                          r.until === 0
                            ? "text-orange-600"
                            : "text-amber-600"
                        }`}
                      >
                        {r.until === 0 ? "hoy" : `${r.until}d`}
                      </span>
                      <div className="mt-1">
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="font-bold">Vencidos</h2>
            <Link
              href="/admin/vencimientos?f=vencidos"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Ver todos →
            </Link>
          </div>
          {expiredRecent.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500">
              No hay vencidos. ¡Buen trabajo!
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {expiredRecent.map((r) => (
                <li key={r.client.id}>
                  <Link
                    href={`/admin/clientes/${r.client.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.client.name}</p>
                      <p className="text-xs text-zinc-500">
                        {r.membership.plan?.name ?? "Sin plan"} · venció{" "}
                        {formatDate(r.membership.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600">
                        {Math.abs(r.until)}d vencido
                      </span>
                      <div className="mt-1">
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
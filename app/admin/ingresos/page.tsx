import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney, toDateKey } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Ingresos",
};

const methodLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

const MONTH_RE = /^\d{4}-\d{2}$/;

function prevMonthKey(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() - 1);
  return toDateKey(d).slice(0, 7);
}

function monthName(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m = "" } = await searchParams;
  const month = MONTH_RE.test(m) ? m : toDateKey(new Date()).slice(0, 7);
  const prevMonth = prevMonthKey(month);

  const payments = await prisma.payment.findMany({
    include: { client: true, plan: true },
    orderBy: { paidAt: "desc" },
  });

  const monthPayments = payments.filter((p) =>
    toDateKey(p.paidAt).startsWith(month)
  );
  const prevPayments = payments.filter((p) =>
    toDateKey(p.paidAt).startsWith(prevMonth)
  );

  const total = monthPayments.reduce((s, p) => s + p.amount, 0);
  const prevTotal = prevPayments.reduce((s, p) => s + p.amount, 0);
  const count = monthPayments.length;
  const avg = count > 0 ? total / count : 0;
  const variation = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;

  const byPlan = new Map<
    string,
    { label: string; count: number; total: number }
  >();
  for (const p of monthPayments) {
    const label = p.plan?.name ?? "Sin plan";
    const entry = byPlan.get(label) ?? { label, count: 0, total: 0 };
    entry.count++;
    entry.total += p.amount;
    byPlan.set(label, entry);
  }
  const planRows = [...byPlan.values()].sort((a, b) => b.total - a.total);

  const byMethod = new Map<
    string,
    { label: string; count: number; total: number }
  >();
  for (const p of monthPayments) {
    const label = methodLabels[p.method] ?? p.method;
    const entry = byMethod.get(label) ?? { label, count: 0, total: 0 };
    entry.count++;
    entry.total += p.amount;
    byMethod.set(label, entry);
  }
  const methodRows = [...byMethod.values()].sort((a, b) => b.total - a.total);

  const byDay = new Map<string, { key: string; total: number }>();
  for (const p of monthPayments) {
    const key = toDateKey(p.paidAt);
    const entry = byDay.get(key) ?? { key, total: 0 };
    entry.total += p.amount;
    byDay.set(key, entry);
  }
  const dayRows = [...byDay.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((d) => ({ ...d, label: `${d.key.slice(8, 10)}/${d.key.slice(5, 7)}` }));
  const maxDay = dayRows.reduce((max, d) => Math.max(max, d.total), 0);

  const lastPayments = monthPayments.slice(0, 15);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black sm:text-2xl">Ingresos</h1>
          <p className="text-sm text-zinc-500">{monthName(month)}</p>
        </div>
        <form action="/admin/ingresos" method="get">
          <input
            type="month"
            name="m"
            defaultValue={month}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
          />
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Total del mes</p>
          <p className="mt-1 text-2xl font-black sm:text-3xl">
            {formatMoney(total)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Vs. mes anterior</p>
          {variation === null ? (
            <p className="mt-1 text-2xl font-black text-zinc-400 sm:text-3xl">
              —
            </p>
          ) : (
            <p className="mt-1 text-2xl font-black sm:text-3xl">
              <span
                className={
                  variation >= 0 ? "text-emerald-600" : "text-red-600"
                }
              >
                {variation >= 0 ? "▲" : "▼"} {Math.abs(variation).toFixed(0)}%
              </span>
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            {formatMoney(prevTotal)} el mes pasado
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Pagos</p>
          <p className="mt-1 text-2xl font-black sm:text-3xl">{count}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Promedio por pago</p>
          <p className="mt-1 text-2xl font-black sm:text-3xl">
            {formatMoney(avg)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold">Por plan</h2>
          {planRows.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin ingresos este mes.</p>
          ) : (
            <ul className="space-y-3">
              {planRows.map((r) => (
                <li key={r.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{r.label}</span>
                    <span className="tabular-nums font-semibold">
                      {formatMoney(r.total)}
                      <span className="ml-2 text-xs font-normal text-zinc-400">
                        {r.count} pago{r.count === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-zinc-100">
                    <div
                      className="h-2 rounded-full bg-red-600"
                      style={{
                        width: `${total > 0 ? (r.total / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold">Por medio de pago</h2>
          {methodRows.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin ingresos este mes.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {methodRows.map((r) => (
                <li key={r.label} className="flex items-center justify-between py-2.5">
                  <span className="font-medium">{r.label}</span>
                  <span className="tabular-nums font-semibold">
                    {formatMoney(r.total)}
                    <span className="ml-2 text-xs font-normal text-zinc-400">
                      {r.count}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Ingresos por día</h2>
        {dayRows.length === 0 ? (
          <p className="text-sm text-zinc-500">Sin ingresos este mes.</p>
        ) : (
          <ul className="space-y-2">
            {dayRows.map((d) => (
              <li key={d.key} className="flex items-center gap-3 text-sm">
                <span className="w-12 shrink-0 tabular-nums text-zinc-500">
                  {d.label}
                </span>
                <div className="h-5 flex-1 rounded bg-zinc-100">
                  <div
                    className="h-5 rounded bg-emerald-500"
                    style={{
                      width: `${maxDay > 0 ? (d.total / maxDay) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right tabular-nums font-semibold">
                  {formatMoney(d.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="font-bold">Últimos pagos del mes</h2>
        </div>
        {lastPayments.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">Sin pagos este mes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-bold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Socio</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Medio</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {lastPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-5 py-2.5 tabular-nums text-zinc-500">
                      {formatDate(p.paidAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 font-medium">
                      {p.client.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-zinc-600">
                      {p.plan?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-zinc-600">
                      {methodLabels[p.method] ?? p.method}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold tabular-nums">
                      {formatMoney(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
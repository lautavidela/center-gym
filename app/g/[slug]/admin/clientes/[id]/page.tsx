import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeStatus } from "@/lib/status";
import { daysUntil, formatDate, formatDateTime, formatMoney } from "@/lib/dates";
import { formatClassesLabel } from "@/lib/plans";
import StatusBadge from "@/components/status-badge";
import PaymentForm from "@/components/payment-form";
import ManualMembershipForm from "@/components/manual-membership-form";
import ClientActions from "@/components/client-actions";

export const metadata: Metadata = {
  title: "Cliente",
};

export default async function ClientePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const clientId = Number(id);
  const client = await prisma.client.findFirst({
    where: { id: clientId, gym: { slug } },
    include: {
      memberships: {
        orderBy: { endDate: "desc" },
        include: { plan: true },
      },
      payments: {
        orderBy: { paidAt: "desc" },
        take: 20,
        include: { plan: true },
      },
      attendances: {
        orderBy: { dateTime: "desc" },
        take: 30,
      },
    },
  });
  if (!client) notFound();

  const plans = await prisma.plan.findMany({ where: { isActive: true, gym: { slug } } });
  const current = client.memberships.find((m) => m.isActive) ?? client.memberships[0];
  const status = computeStatus(current?.endDate, client.isSuspended);
  const daysLeft = current ? daysUntil(new Date(), current.endDate) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-xl font-black sm:text-2xl">{client.name}</h1>
              <StatusBadge status={status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500">
              {client.dni && <span>DNI {client.dni}</span>}
              {client.phone && <span>📞 {client.phone}</span>}
              {client.email && <span>✉ {client.email}</span>}
              <span>Registrado el {formatDate(client.createdAt)}</span>
            </div>
            {client.notes && (
              <p className="mt-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
                {client.notes}
              </p>
            )}
          </div>
          <ClientActions
            clientId={client.id}
            isSuspended={client.isSuspended}
            slug={slug}
          />
        </div>

        {current && (
          <div className="mt-5 grid gap-4 rounded-xl bg-zinc-50 p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Plan
              </p>
              <p className="font-semibold">{current.plan?.name ?? "—"}</p>
              {current.plan && (
                <p className="text-xs font-normal text-zinc-500">
                  {formatClassesLabel(current.plan.classesPerMonth)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Inicio
              </p>
              <p>{formatDate(current.startDate)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Vencimiento
              </p>
              <p
                className={`font-semibold ${
                  status === "vencido"
                    ? "text-red-600"
                    : status === "vence-hoy" || status === "vence-pronto"
                      ? "text-amber-600"
                      : ""
                }`}
              >
                {formatDate(current.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Restan
              </p>
              <p className="font-semibold">
                {daysLeft === null
                  ? "—"
                  : daysLeft < 0
                    ? `${Math.abs(daysLeft)} días vencido`
                    : `${daysLeft} día${daysLeft === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {plans.length > 0 && (
            <PaymentForm
              clientId={client.id}
              plans={plans}
              currentPlanId={current?.planId ?? null}
              clientSuspended={client.isSuspended}
            />
          )}

          {!current && plans.length > 0 && (
            <ManualMembershipForm clientId={client.id} plans={plans} />
          )}

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Historial de pagos</h2>
            {client.payments.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin pagos registrados.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {client.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium">{p.plan?.name ?? "—"}</p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(p.paidAt)} · {p.method}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </p>
                    </div>
                    <span className="font-semibold">{formatMoney(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Asistencias recientes</h2>
            {client.attendances.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin registros todavía.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {client.attendances.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      ✓
                    </span>
                    <span className="text-sm text-zinc-600">{formatDateTime(a.dateTime)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Historial de membresías</h2>
            {client.memberships.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin membresías anteriores.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {client.memberships.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium">
                        {m.plan?.name ?? "Sin plan"}
                        {m.isActive && (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            actual
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(m.startDate)} → {formatDate(m.endDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
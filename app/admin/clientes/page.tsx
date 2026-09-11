import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeStatus } from "@/lib/status";
import { formatDate } from "@/lib/dates";
import StatusBadge from "@/components/status-badge";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { dni: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : undefined,
    include: {
      memberships: {
        where: { isActive: true },
        orderBy: { endDate: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black sm:text-2xl">Clientes</h1>
          <p className="text-sm text-zinc-500">
            {clients.length} socio{clients.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
        >
          + Nuevo cliente
        </Link>
      </div>

      <form action="/admin/clientes" method="get" className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre, DNI o teléfono…"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-zinc-100 px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400 md:grid">
          <span>Cliente</span>
          <span className="w-28">Plan</span>
          <span className="w-32">Vence</span>
          <span className="w-24 text-right">Estado</span>
        </div>

        {clients.length === 0 && (
          <p className="p-8 text-center text-zinc-500">
            No hay socios{query ? " que coincidan con la búsqueda" : " todavía"}.
          </p>
        )}

        {clients.map((client) => {
          const membership = client.memberships[0];
          const status = computeStatus(
            membership?.endDate,
            client.isSuspended
          );
          return (
            <Link
              key={client.id}
              href={`/admin/clientes/${client.id}`}
              className="grid grid-cols-1 gap-3 border-b border-zinc-100 px-5 py-4 transition last:border-0 hover:bg-zinc-50 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{client.name}</p>
                <p className="text-sm text-zinc-500">
                  {client.dni ? `DNI ${client.dni}` : "Sin DNI"}
                  {client.phone ? ` · ${client.phone}` : ""}
                </p>
              </div>
              <div className="text-sm text-zinc-600 md:w-28">
                {membership?.plan?.name ?? "—"}
              </div>
              <div className="text-sm md:w-32">
                {membership ? (
                  <span
                    className={
                      status === "vencido"
                        ? "font-semibold text-red-600"
                        : status === "vence-hoy" || status === "vence-pronto"
                          ? "font-semibold text-amber-600"
                          : ""
                    }
                  >
                    {formatDate(membership.endDate)}
                  </span>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </div>
              <div className="md:w-24 md:text-right">
                <StatusBadge status={status} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
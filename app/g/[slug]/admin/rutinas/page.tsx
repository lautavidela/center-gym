import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/gyms";
import { DAYS } from "@/lib/routines";

export const metadata: Metadata = {
  title: "Rutinas",
};

export default async function RutinasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q = "" } = await searchParams;
  const query = q.trim();

  const clients = await prisma.client.findMany({
    where: {
      gym: { slug },
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { dni: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      routineExercises: {
        select: { day: true },
        distinct: ["day"],
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black sm:text-2xl">Rutinas</h1>
          <p className="text-sm text-zinc-500">
            Armá la rutina por día de cada socio. Elegí uno para empezar.
          </p>
        </div>
      </div>

      <form action={adminPath(slug, "/rutinas")} method="get" className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Buscar socio por nombre, DNI o teléfono…"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {clients.length === 0 && (
          <p className="p-8 text-center text-zinc-500">
            No hay socios{query ? " que coincidan con la búsqueda" : " todavía"}.
          </p>
        )}

        {clients.map((client) => {
          const days = client.routineExercises
            .map((r) => r.day)
            .sort((a, b) => a - b);
          return (
            <Link
              key={client.id}
              href={adminPath(slug, `/rutinas/${client.id}`)}
              className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 transition last:border-0 hover:bg-zinc-50"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{client.name}</p>
                <p className="text-sm text-zinc-500">
                  {client.dni ? `DNI ${client.dni}` : "Sin DNI"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {days.length === 0 ? (
                  <span className="text-sm text-zinc-400">Sin rutina</span>
                ) : (
                  <>
                    <span className="hidden sm:inline text-sm text-zinc-500">
                      {days.length === 1
                        ? "1 día"
                        : `${days.length} días`}
                    </span>
                    <span className="flex flex-wrap justify-end gap-1">
                      {days.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                        >
                          {DAYS[d]}
                        </span>
                      ))}
                    </span>
                  </>
                )}
                <span className="ml-1 text-zinc-300">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
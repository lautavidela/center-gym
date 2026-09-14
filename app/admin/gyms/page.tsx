import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GymsForm from "./gyms-form";
import GymDeleteButton from "./gym-delete-button";

export const metadata = {
  title: "Gyms · Superadmin",
};

export const dynamic = "force-dynamic";

export default async function GymsPage() {
  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { include: { gym: true } },
      _count: { select: { clients: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-black sm:text-2xl">Gyms</h1>
        <p className="text-sm text-zinc-500">
          Creá un gimnasio nuevo con su usuario de administración.
        </p>
      </div>

      <GymsForm />

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="font-bold">Gimnasios ({gyms.length})</h2>
        </div>
        {gyms.length === 0 ? (
          <p className="p-8 text-center text-zinc-500">
            Todavía no hay gimnasios.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {gyms.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/g/${g.slug}/admin`}
                    className="font-bold hover:text-emerald-700"
                  >
                    {g.name}
                  </Link>
                  <p className="text-sm text-zinc-500">
                    /g/{g.slug} · {g._count.clients} socios ·{" "}
                    {g.users.map((u) => u.email).join(", ") || "sin usuarios"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <GymDeleteButton gymId={g.id} gymName={g.name} />
                  <Link
                    href={`/g/${g.slug}/mi-cuota`}
                    className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                  >
                    Ver consulta pública →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
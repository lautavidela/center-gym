import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, toDateKey } from "@/lib/dates";
import AttendanceRegister from "@/components/attendance-register";
import RemoveAttendanceButton from "@/components/remove-attendance";

export const metadata: Metadata = {
  title: "Asistencias",
};

export default async function AsistenciasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { slug } = await params;
  const { d } = await searchParams;
  const day = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : toDateKey(new Date());
  const isToday = day === toDateKey(new Date());

  const attendances = await prisma.attendance.findMany({
    where: { day, gym: { slug } },
    include: { client: true },
    orderBy: { dateTime: "desc" },
    take: isToday ? 100 : undefined,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-black sm:text-2xl">Asistencias</h1>
        <p className="text-sm text-zinc-500">Control de ingresos por día.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <AttendanceRegister />

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3">
            <div>
              <h2 className="font-bold">Registro del día</h2>
              <p className="text-xs text-zinc-500">
                {formatDate(new Date(day + "T12:00:00"))} ·{" "}
                {attendances.length} asistencia
                {attendances.length === 1 ? "" : "s"}
              </p>
            </div>
            <form
              action={`/g/${slug}/admin/asistencias`}
              method="get"
            >
              <input
                type="date"
                name="d"
                defaultValue={day}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </form>
          </div>

          {attendances.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500">
              Sin registros para este día.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {attendances.map((a) => {
                const time = new Date(a.dateTime);
                const h = String(time.getHours()).padStart(2, "0");
                const min = String(time.getMinutes()).padStart(2, "0");
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 px-5 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        ✓
                      </span>
                      <div>
                        <p className="font-medium">{a.client.name}</p>
                        <p className="text-xs text-zinc-500">
                          {a.client.dni ? `DNI ${a.client.dni}` : "Sin DNI"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">{h}:{min}</span>
                      <RemoveAttendanceButton id={a.id} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
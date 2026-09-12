import Link from "next/link";

const features = [
  {
    icon: "👥",
    title: "Socios y vencimientos",
    desc: "Datos de tus socios, estado de membresía y avisos de vencimiento al día.",
  },
  {
    icon: "✓",
    title: "Asistencias",
    desc: "Registrá la entrada de cada socio con un par de toques, sin planillas.",
  },
  {
    icon: "💰",
    title: "Cobro de cuotas",
    desc: "Renovaciones y pagos sin papel, con el plan y el precio justo.",
  },
  {
    icon: "📈",
    title: "Ingresos",
    desc: "Estadísticas del mes por plan y medio de pago para saber cómo va tu gym.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <p className="text-xl font-black tracking-tight">
            <span className="text-emerald-600">MT</span>Gym
          </p>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
            Monitoreá tu gym
          </span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Monitoreá tu <span className="text-emerald-600">gym</span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600">
            Socios, cuotas, asistencias e ingresos en un solo lugar. Simple para
            vos y fácil para tus clientes.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <Link
              href="/mi-cuota"
              className="w-full max-w-xs rounded-xl bg-emerald-600 px-6 py-4 text-center text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Consultá tu cuota
            </Link>
            <p className="text-sm text-zinc-500">
              Ya sos socio · buscá tu vencimiento y pagos con tu DNI
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                {f.icon}
              </div>
              <h2 className="mt-3 font-bold">{f.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs text-zinc-400">
          MTGym · Monitoreá tu gym © {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
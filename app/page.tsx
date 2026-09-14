import Link from "next/link";
import Brand from "@/components/brand";

const WHATSAPP_URL =
  "https://wa.me/5490000000000?text=Hola%20MTGym%2C%20quiero%20saber%20m%C3%A1s%20sobre%20el%20sistema";

function Icon(props: { path: string; className?: string }) {
  const { path, className } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-6 w-6 ${className ?? ""}`}
    >
      <path d={path} />
    </svg>
  );
}

const icons = {
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  card: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22",
  calendar:
    "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM13 16h-2l2-3h-2",
  check: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3",
  chart:
    "M22 17H2M6 13v4M10 9v8M14 5v12M18 10v7",
  upload:
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  phone:
    "M19.5 14.5v4a2 2 0 0 1-2.17 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1-.63 2.67 2 2 0 0 1 1.5.5h4a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L6.09 8.91a16 16 0 0 0 6 6l1.77-1.77a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 19.5 14.5z",
};

const features = [
  {
    icon: icons.users,
    title: "Socios y búsqueda",
    desc: "Alta por DNI, ficha con membresía e historial, suspensión y búsqueda al instante por nombre o DNI.",
  },
  {
    icon: icons.tag,
    title: "Planes por clases",
    desc: "Planillas mensuales con clases incluidas y precio, activas o inactivas, sin planillas de papel.",
  },
  {
    icon: icons.card,
    title: "Cobro de cuotas",
    desc: "Registrá pagos con su método y monto; la cuota se renueva sola por un mes más.",
  },
  {
    icon: icons.calendar,
    title: "Vencimientos",
    desc: "El panel te muestra quién vence en 7 o 30 días y quién ya está vencido.",
  },
  {
    icon: icons.check,
    title: "Asistencia diaria",
    desc: "Registrá la entrada de cada socio con un par de toques, con historial completo.",
  },
  {
    icon: icons.chart,
    title: "Ingresos",
    desc: "Estadísticas del mes por plan y medio de pago para saber cómo va tu gym.",
  },
  {
    icon: icons.upload,
    title: "Migración desde Excel",
    desc: "Importá tu lista de socios actual en segundos: no tenés que cargar nada a mano.",
  },
  {
    icon: icons.phone,
    title: "Consulta pública",
    desc: "Tus socios ven su vencimiento y pagos con su DNI desde el celular, sin llamarte.",
  },
];

const comparison = [
  {
    before: "El control de socios, cuotas y asistencia depende del papel y la memoria",
    after: "Todo el historial digitalizado y buscable en segundos",
  },
  {
    before: "Cuotas que vencen y no te enterás a tiempo",
    after: "Avisos claros de vencimientos (7 y 30 días) y de los ya vencidos",
  },
  {
    before: "No sabés cuánto ingresa el gimnasio cada mes",
    after: "Ingresos calculados por plan y medio de pago, al toque",
  },
  {
    before: "Con varios turnos o locales, la información se mezcla",
    after: "Cada gimnasio con su caja y sus socios, ordenados y aislados",
  },
  {
    before: "Tus socios no tienen forma de saber su estado",
    after: "Consulta de cuota por DNI, directo desde su celular",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-4 w-4 ${className ?? ""}`}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-4 w-4 ${className ?? ""}`}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CuotaPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-6 text-left shadow-2xl ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black tracking-tight">
          <span className="text-emerald-600">MT</span>Gym · Mi cuota
        </p>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Consultá con tu DNI
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-emerald-600 p-4 text-white">
        <p className="text-xs opacity-90">Gimnasio: Fitness Garden</p>
        <p className="mt-1 text-lg font-bold">Juan Pérez</p>
        <p className="mt-2 text-2xl font-black sm:text-3xl">23 días restantes</p>
        <p className="text-sm opacity-90">Cuota al día</p>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Plan</dt>
          <dd className="font-semibold">Mensual todos los días</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Vencimiento</dt>
          <dd className="font-semibold">12/10/2026</dd>
        </div>
      </dl>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Brand />
            <p className="text-xl font-black tracking-tight">
              <span className="text-emerald-600">MT</span>Gym
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-zinc-500 sm:inline">
              ¿Sos dueño?
            </span>
            <Link
              href="/login"
              className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-white" />
                Monitoreá tu gym
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
                Monitoreá tu gym
              </h1>
              <p className="mt-5 text-lg text-emerald-50">
                Socios, cuotas, asistencias e ingresos en un solo lugar. Simple
                para vos y fácil para tus clientes.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/mi-cuota"
                  className="w-full max-w-xs rounded-xl bg-white px-6 py-4 text-center text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50 sm:w-auto"
                >
                  Consultá tu cuota
                </Link>
              </div>
              <p className="mt-4 text-sm text-emerald-50/90">
                Ya sos socio · buscá tu vencimiento y pagos con tu DNI
              </p>
            </div>
            <CuotaPreviewCard />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-3xl bg-zinc-100 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-zinc-500">
              Sin MTGym
            </p>
            <ul className="mt-5 space-y-5">
              {comparison.map((c) => (
                <li key={c.before} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                    <XIcon />
                  </span>
                  <span className="text-base text-zinc-600 sm:text-lg">
                    {c.before}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center">
            <span className="rounded-full bg-emerald-600 px-5 py-2.5 text-base font-black text-white shadow-lg sm:text-lg">
              → MTGym
            </span>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 shadow-lg sm:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-100">
              Con MTGym
            </p>
            <ul className="mt-5 space-y-5">
              {comparison.map((c) => (
                <li key={c.after} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600">
                    <CheckIcon />
                  </span>
                  <span className="text-base text-white sm:text-lg">{c.after}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Todo lo que hace <span className="text-emerald-600">MTGym</span>
          </h2>
          <p className="mt-3 text-lg text-zinc-600">
            Un solo panel para llevar el día a día de tu gimnasio, de la primera
            cuota al cierre del mes.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl hover:ring-2 hover:ring-emerald-100"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Icon path={f.icon} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
              <Icon path={icons.phone} className="h-7 w-7" />
            </div>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            La consulta de cuota para <span className="text-emerald-600">tus socios</span>
          </h2>
          <p className="mt-3 text-lg text-zinc-600">
            Tus clientes consultan cuándo vence su cuota y sus pagos con solo su
            DNI, desde el celular y sin llamarte. Y si cambiaron de gimnasio,
            ven su cuota de cada uno y eligen.
          </p>
          <Link
            href="/mi-cuota"
            className="mt-7 inline-block rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Probalo: consultá tu cuota
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-center shadow-xl sm:p-12">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            ¿Listo para usar MTGym?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-emerald-50">
            Empezá hoy a monitorear tu gimnasio: socios, cuotas, asistencias e
            ingresos en un solo lugar.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs rounded-xl bg-white px-6 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Comenzá a monitorear
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t-4 border-emerald-600 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xl font-black tracking-tight">
                <span className="text-emerald-600">MT</span>Gym
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Monitoreá tu gym: gestión de socios, cuotas, asistencias e
                ingresos para tu gimnasio. Simple para vos y fácil para tus
                clientes.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Plataforma
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/mi-cuota" className="text-zinc-600 hover:text-emerald-600">
                    Consultar tu cuota
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-zinc-600 hover:text-emerald-600">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-zinc-600 hover:text-emerald-600">
                    Panel de administración
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Sobre MTGym
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-500">
                <li>Hecha para dueños de gimnasios</li>
                <li>Sin libretas ni planillas de papel</li>
                <li>Multi-gimnasio desde un solo panel</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-zinc-100 pt-6 text-sm text-zinc-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} MTGym — Monitoreá tu gym. Todos los
              derechos reservados.
            </p>
            <p>MTGym v0.1</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
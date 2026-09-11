import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            CENTER GYM
          </span>
        </h1>
        <p className="mt-3 text-zinc-500">
          Consultá tu cuota y mantenete al día.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <Link
          href="/mi-cuota"
          className="rounded-xl bg-red-600 px-6 py-4 text-center text-lg font-semibold text-white shadow-md transition hover:bg-red-700"
        >
          Consultá tu vencimiento
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100"
        >
          Ingreso del dueño
        </Link>
      </div>
    </main>
  );
}
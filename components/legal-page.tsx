import type { ReactNode } from "react";
import Link from "next/link";
import Brand from "@/components/brand";

export default function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Brand />
            <span className="text-xl font-black tracking-tight">
              <span className="text-emerald-600">MT</span>Gym
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
          MTGym
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Última actualización: {updated}
        </p>
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}
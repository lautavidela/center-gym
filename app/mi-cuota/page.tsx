import type { Metadata } from "next";
import ConsultaGlobalForm from "./consulta-form";

export const metadata: Metadata = {
  title: "Mi cuota",
  description: "Consultá la fecha de vencimiento de tu membresía.",
};

export const dynamic = "force-dynamic";

export default function MiCuotaPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="text-emerald-600">MT</span>Gym
        </h1>
        <p className="mt-2 text-zinc-500">
          Ingresá tu DNI para ver tu cuota en cada gimnasio
        </p>
      </div>
      <ConsultaGlobalForm />
    </main>
  );
}
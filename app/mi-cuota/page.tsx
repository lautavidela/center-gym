import type { Metadata } from "next";
import ConsultaForm from "./consulta-form";

export const metadata: Metadata = {
  title: "Mi cuota",
  description: "Consultá la fecha de vencimiento de tu membresía.",
};

export default function MiCuotaPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <h1 className="break-words text-3xl font-black tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            CENTER GYM
          </span>
        </h1>
        <p className="mt-2 text-zinc-500">Ingresá tu DNI para ver tu cuota</p>
      </div>
      <ConsultaForm />
    </main>
  );
}
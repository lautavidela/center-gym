import type { Metadata } from "next";
import MigrationAssistant from "@/components/migration-assistant";

export const metadata: Metadata = {
  title: "Migración desde Excel",
};

export default function MigracionPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-black sm:text-2xl">Migración desde Excel</h1>
        <p className="text-sm text-zinc-500">
          Cargá el Excel del gimnasio una sola vez y traé a todos tus socios.
          Reviso el resultado antes de confirmar.
        </p>
      </div>
      <MigrationAssistant />
    </div>
  );
}
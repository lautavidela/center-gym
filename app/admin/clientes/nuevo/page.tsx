import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/admin/actions/clients";
import ClientForm from "../client-form";

export const metadata: Metadata = {
  title: "Nuevo cliente",
};

export default async function NuevoClientePage() {
  const plans = await prisma.plan.findMany({ where: { isActive: true } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-black">Nuevo cliente</h1>
      <ClientForm action={createClient} plans={plans} submitLabel="Crear cliente" />
    </div>
  );
}
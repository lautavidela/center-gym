import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/admin/actions/clients";
import ClientForm from "../client-form";

export const metadata: Metadata = {
  title: "Nuevo cliente",
};

export default async function NuevoClientePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plans = await prisma.plan.findMany({ where: { isActive: true, gym: { slug } } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-xl font-black sm:text-2xl">Nuevo cliente</h1>
      <ClientForm
        action={createClient}
        plans={plans}
        submitLabel="Crear cliente"
        slug={slug}
      />
    </div>
  );
}
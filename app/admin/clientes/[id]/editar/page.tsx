import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateClient } from "@/app/admin/actions/clients";
import ClientForm from "../../client-form";

export const metadata: Metadata = {
  title: "Editar cliente",
};

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = Number(id);
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) notFound();

  const plans = await prisma.plan.findMany({ where: { isActive: true } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-black">Editar cliente</h1>
      <ClientForm
        action={updateClient.bind(null, client.id)}
        plans={plans}
        submitLabel="Guardar cambios"
        defaults={{
          dni: client.dni ?? "",
          name: client.name,
          phone: client.phone,
          email: client.email,
          notes: client.notes,
        }}
      />
    </div>
  );
}
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
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const clientId = Number(id);
  const client = await prisma.client.findFirst({
    where: { id: clientId, gym: { slug } },
  });
  if (!client) notFound();

  const plans = await prisma.plan.findMany({ where: { isActive: true, gym: { slug } } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-xl font-black sm:text-2xl">Editar cliente</h1>
      <ClientForm
        action={updateClient.bind(null, client.id)}
        plans={plans}
        submitLabel="Guardar cambios"
        slug={slug}
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
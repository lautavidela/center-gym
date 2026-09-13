import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGymBySlug } from "@/lib/gyms";
import ConsultaForm from "./consulta-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gym = await getGymBySlug(slug);
  return { title: gym ? `Mi cuota · ${gym.name}` : "Mi cuota" };
}

export default async function MiCuotaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gym = await getGymBySlug(slug);
  if (!gym) notFound();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <h1 className="break-words text-3xl font-black tracking-tight sm:text-4xl">
          <span className="text-emerald-600">MT</span>Gym
        </h1>
        <p className="mt-2 text-zinc-500">
          {gym.name} · Ingresá tu DNI para ver tu cuota
        </p>
      </div>
      <ConsultaForm gymId={gym.id} gymName={gym.name} />
      <Link
        href="/mi-cuota"
        className="mt-6 block text-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        ¿Sos socio de otro gimnasio? Ver todas tus cuotas →
      </Link>
    </main>
  );
}
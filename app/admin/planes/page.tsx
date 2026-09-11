import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PlanForm from "./plan-form";
import PlanRow from "./plan-row";

export const metadata: Metadata = {
  title: "Planes",
};

export default async function PlanesPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Planes</h1>
        <p className="text-sm text-zinc-500">
          Definen la duración y el precio de cada membresía.
        </p>
      </div>

      <PlanForm />

      <div className="mt-6 flex flex-col gap-3">
        {plans.length === 0 && (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-zinc-500">
            Todavía no hay planes. Creá el primero arriba.
          </p>
        )}
        {plans.map((plan) => (
          <PlanRow key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
"use client";

import {
  deleteClient,
  setClientSuspended,
} from "@/app/admin/actions/clients";

export default function ClientActions({
  clientId,
  isSuspended,
}: {
  clientId: number;
  isSuspended: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={setClientSuspended.bind(null, clientId, !isSuspended)}>
        <button
          type="submit"
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            isSuspended
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {isSuspended ? "Reactivar" : "Suspender"}
        </button>
      </form>
      <a
        href={`/admin/clientes/${clientId}/editar`}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
      >
        Editar
      </a>
      <form
        action={deleteClient.bind(null, clientId)}
        onSubmit={(e) => {
          if (
            !confirm(
              "¿Eliminar este cliente? Se borrarán su membresía, pagos y asistencias. Esta acción no se puede deshacer."
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </form>
    </div>
  );
}
"use client";

import { useActionState, useState } from "react";
import { deleteGym, type DeleteGymState } from "@/app/admin/actions/gyms";

export default function GymDeleteButton({
  gymId,
  gymName,
}: {
  gymId: number;
  gymName: string;
}) {
  const [armed, setArmed] = useState(false);
  const [typed, setTyped] = useState("");
  const [state, formAction, isPending] = useActionState<
    DeleteGymState,
    FormData
  >(deleteGym.bind(null, gymId), {});

  const matches = typed.trim() === gymName;

  if (armed) {
    return (
      <div className="w-64 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3">
        {state.message && (
          <p className="mb-2 rounded-md bg-emerald-50 px-2 py-1.5 text-sm font-medium text-emerald-700">
            ✓ {state.message}
          </p>
        )}
        {state.error && (
          <p className="mb-2 rounded-md bg-white px-2 py-1.5 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <p className="text-sm text-red-900">
          Se borrarán socios, pagos, asistencias, planes y el usuario del
          dueño. Escribí <b className="break-all">{gymName}</b> para
          confirmar:
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={gymName}
          autoFocus
          className="mt-2 w-full rounded-lg border border-red-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-400"
        />
        <form action={formAction} className="mt-2">
          <button
            type="submit"
            disabled={!matches || isPending}
            className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
          >
            {isPending ? "Eliminando…" : "Eliminar definitivamente"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (
          confirm(
            `¿Eliminar el gimnasio "${gymName}" y TODOS sus datos — socios, pagos, asistencia, planes y usuario —? Esta acción NO se puede deshacer.`
          )
        ) {
          setArmed(true);
          setTyped("");
        }
      }}
      className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Eliminar
    </button>
  );
}
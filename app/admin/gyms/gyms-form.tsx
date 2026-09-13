"use client";

import { useActionState } from "react";
import { createGym, type CreateGymState } from "@/app/admin/actions/gyms";

export default function GymsForm() {
  const [state, formAction, isPending] = useActionState<CreateGymState, FormData>(
    createGym,
    {}
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-bold">Nuevo gimnasio</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Se crea el gimnasio, un usuario administrador y sus planes iniciales.
      </p>

      {state.error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.url && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✓ Gimnasio creado. El dueño puede entrar en{" "}
          <b>
            https://center-gym-gilt.vercel.app{state.url}
          </b>{" "}
          con <b>{state.email}</b>.
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
          Nombre del gimnasio
          <input
            type="text"
            name="name"
            required
            placeholder="Ej: Power Gym Palermo"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Email del dueño
          <input
            type="email"
            name="ownerEmail"
            required
            placeholder="admin@gimnasio.com"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
          Contraseña inicial
          <input
            type="text"
            name="ownerPassword"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "Creando…" : "Crear gimnasio"}
      </button>
    </form>
  );
}
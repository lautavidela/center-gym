"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <p className="text-center text-3xl font-black tracking-tight">
        <span className="text-emerald-600">MT</span>Gym
      </p>
      <h1 className="mt-2 text-center text-lg font-bold">Ingreso al panel</h1>
      <p className="mb-5 text-center text-sm text-zinc-500">
        Gestión de tu gimnasio
      </p>

      {state.error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="mb-1 block text-sm font-medium text-zinc-700">
        Email
      </label>
      <input
        type="email"
        name="email"
        autoComplete="username"
        required
        className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <label className="mb-1 block text-sm font-medium text-zinc-700">
        Contraseña
      </label>
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        required
        className="mb-6 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
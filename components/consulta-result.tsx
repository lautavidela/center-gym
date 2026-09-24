"use client";

import { useState, useTransition } from "react";
import type { ConsultaView } from "@/lib/consulta";
import RoutineSection from "@/components/routine-section";
import RoutineSelfEditor from "@/components/routine-self-editor";
import PinSetup from "@/components/pin-setup";
import {
  confirmarCambiarPin,
  confirmarCrearPin,
  confirmarResetPin,
  ingresarPin,
  solicitarCodigoCambiarPin,
  solicitarCodigoCrearPin,
  solicitarCodigoResetPin,
} from "@/app/actions/cliente-pin";

const weights = (amount: number) =>
  amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

function MembershipCard({ view, gymName }: { view: ConsultaView; gymName: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="px-5 py-4 text-center sm:px-6 sm:py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Gimnasio: {gymName}
        </p>
        <p className="break-words text-lg font-bold sm:text-xl">
          {view.clientName}
        </p>
        <p className="text-sm text-zinc-500">
          DNI consultado para su membresía
        </p>
      </div>

      {!view.hasMembership ? (
        <div className="bg-red-600 px-5 py-4 text-white sm:px-6">
          <p className="text-lg font-bold">
            Todavía no tiene una membresía cargada
          </p>
          <p className="text-sm opacity-90">Consultá con la administración.</p>
        </div>
      ) : (
        <>
          <div
            className={`px-5 py-4 text-white sm:px-6 ${
              view.status === "vencido"
                ? "bg-red-600"
                : view.status === "vence-hoy"
                  ? "bg-amber-500"
                  : "bg-emerald-600"
            }`}
          >
            <p className="break-words text-2xl font-black sm:text-3xl">
              {view.daysLeft! >= 0
                ? `${view.daysLeft} día${view.daysLeft === 1 ? "" : "s"} restantes`
                : `Vencido hace ${Math.abs(view.daysLeft!)} día${Math.abs(view.daysLeft!) === 1 ? "" : "s"}`}
            </p>
            <p className="text-sm opacity-90">
              {view.status === "al-dia"
                ? "Cuota al día"
                : view.status === "vence-hoy"
                  ? "Tu cuota vence hoy"
                  : "Tu cuota está vencida"}
            </p>
          </div>

          <dl className="divide-y divide-zinc-100 px-5 text-sm sm:px-6">
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Plan</dt>
              <dd className="text-right">
                <span className="font-semibold">{view.plan ?? "—"}</span>
                {view.planDetail && (
                  <span className="block text-xs font-normal text-zinc-500">
                    {view.planDetail}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Desde</dt>
              <dd className="text-right">{view.startDate}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="shrink-0 text-zinc-500">Vencimiento</dt>
              <dd className="text-right font-semibold">{view.endDate}</dd>
            </div>
          </dl>
        </>
      )}

      {view.payments.length > 0 && (
        <div className="border-t border-zinc-100 px-5 py-4 sm:px-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">
            Últimos pagos
          </p>
          <ul className="space-y-1 text-sm text-zinc-700">
            {view.payments.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <span className="break-words">
                  {p.date} · {p.plan}
                </span>
                <span className="shrink-0 font-medium">{weights(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PinGate({
  gymId,
  dni,
  hasPin,
  clientName,
  onUnlock,
  onReset,
}: {
  gymId: number;
  dni: string;
  hasPin: boolean;
  clientName: string;
  onUnlock: (view: ConsultaView, pin: string) => void;
  onReset: () => void;
}) {
  const [mode, setMode] = useState<"enter" | "create" | "reset">(hasPin ? "enter" : "create");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUnlock = () => {
    if (pin.length !== 4) {
      setMessage("El PIN tiene 4 dígitos.");
      return;
    }
    setMessage(null);
    setInfo(null);
    startTransition(async () => {
      const res = await ingresarPin(gymId, dni, pin);
      if (res.ok) {
        onUnlock(res.view, pin);
        return;
      }
      if (res.locked) setMessage("Demasiados intentos. Esperá un minuto.");
      else setMessage(res.message);
    });
  };

  const reenter = () => {
    setMode("enter");
    setPin("");
    setMessage(null);
    setInfo(null);
  };

  const autoLogin = (createdPin: string) => {
    startTransition(async () => {
      const res = await ingresarPin(gymId, dni, createdPin);
      if (res.ok) {
        onUnlock(res.view, createdPin);
        return;
      }
      if (res.locked) setMessage("Demasiados intentos. Esperá un minuto.");
      else setMessage(res.message);
      reenter();
    });
  };

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={onReset}
        className="mb-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        ← Cambiar DNI
      </button>
      <h2 className="text-lg font-bold text-zinc-800">{clientName}</h2>
      <p className="text-sm text-zinc-500">
        {mode === "enter"
          ? "Ingresá tu PIN para ver tu mensualidad y rutina."
          : "Confirmá tu identidad con un código para crear tu PIN."}
      </p>

      {message && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      )}
      {info && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {info}
        </p>
      )}

      {mode === "enter" && (
        <div className="mt-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="●●●●"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleUnlock}
            className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? "…" : "Entrar"}
          </button>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="mt-3 w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ¿Olvidaste tu PIN?
          </button>
        </div>
      )}

      {mode === "create" && (
        <PinSetup
          title="Crear tu PIN"
          description="Elegí tu PIN de 4 dígitos. Primero crealo y después confirmá con el código que te llega por email."
          confirmLabel="Crear PIN"
          send={async () => solicitarCodigoCrearPin(gymId, dni)}
          confirm={async ({ pin: p, code }) => confirmarCrearPin(gymId, dni, code, p)}
          onSuccess={autoLogin}
          onBack={onReset}
          cancelLabel="← Cambiar DNI"
        />
      )}

      {mode === "reset" && (
        <PinSetup
          title="Restablecer tu PIN"
          description="Elegí tu PIN nuevo. Primero crealo y después confirmá con el código que te llega por email."
          confirmLabel="Restablecer PIN"
          send={async () => solicitarCodigoResetPin(gymId, dni)}
          confirm={async ({ pin: p, code }) => confirmarResetPin(gymId, dni, code, p)}
          onSuccess={autoLogin}
          onBack={reenter}
          cancelLabel="← Volver"
        />
      )}
    </div>
  );
}

function ChangePin({
  gymId,
  dni,
  onChanged,
}: {
  gymId: number;
  dni: string;
  onChanged: (newPin: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  if (!open) {
    return (
      <>
        {info && !open && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </p>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 flex w-full items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          Cambiar mi PIN
        </button>
      </>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <PinSetup
        title="Cambiar mi PIN"
        description="Elegí tu PIN nuevo. Primero crealo y después confirmá con el código que te llega por email."
        confirmLabel="Confirmar cambio"
        extraFields={[{ key: "current", label: "PIN actual", placeholder: "PIN actual" }]}
        send={async ({ extra }) => solicitarCodigoCambiarPin(gymId, dni, extra.current ?? "")}
        confirm={async ({ pin: p, code }) => confirmarCambiarPin(gymId, dni, code, p)}
        onSuccess={(newPin) => {
          setOpen(false);
          setInfo("PIN actualizado.");
          onChanged(newPin);
        }}
        onBack={() => setOpen(false)}
        cancelLabel="Cancelar"
      />
    </div>
  );
}

export default function ConsultaResult({
  gymId,
  gymName,
  dni,
  clientName,
  hasPin,
  onReset,
}: {
  gymId: number;
  gymName: string;
  dni: string;
  clientName: string;
  hasPin: boolean;
  onReset: () => void;
}) {
  const [view, setView] = useState<ConsultaView | null>(null);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<"mensualidad" | "rutina">("mensualidad");
  const [editing, setEditing] = useState(false);

  if (!view) {
    return (
      <PinGate
        gymId={gymId}
        dni={dni}
        hasPin={hasPin}
        clientName={clientName}
        onReset={onReset}
        onUnlock={(v, p) => {
          setView(v);
          setPin(p);
        }}
      />
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("mensualidad")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            tab === "mensualidad"
              ? "bg-emerald-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Mensualidad
        </button>
        <button
          type="button"
          onClick={() => setTab("rutina")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            tab === "rutina"
              ? "bg-emerald-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Mi rutina
        </button>
      </div>
      <p className="mb-3 text-center text-sm text-zinc-400">
        Conectado como {view.clientName} ·{" "}
        <button
          type="button"
          onClick={onReset}
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          salir
        </button>
      </p>

      {tab === "mensualidad" && (
        <>
          <MembershipCard view={view} gymName={gymName} />
          <ChangePin gymId={gymId} dni={dni} onChanged={(newPin) => setPin(newPin)} />
        </>
      )}

      {tab === "rutina" &&
        (editing ? (
          <RoutineSelfEditor
            gymId={gymId}
            dni={dni}
            pin={pin}
            initial={view.routine.map((r) => ({
              id: r.id,
              day: r.day,
              sets: r.sets,
              reps: r.reps,
              rest: r.rest,
              notes: r.notes,
              order: r.order,
              exercise: {
                id: r.exerciseId,
                name: r.name,
                muscle: r.muscle,
                bodyPart: r.bodyPart,
                equipment: r.equipment,
                gifUrl: r.gifUrl,
              },
            }))}
            onExit={() => setEditing(false)}
          />
        ) : view.routine.length > 0 ? (
          <>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Editar mi rutina
              </button>
            </div>
            <RoutineSection routine={view.routine} />
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-bold text-zinc-800">
              Todavía no tenés rutina
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              El profesor puede armártela, o creala vos a tu gusto.
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Crear mi rutina
            </button>
          </div>
        ))}
    </div>
  );
}
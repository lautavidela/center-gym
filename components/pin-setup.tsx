"use client";

import { useState, useTransition } from "react";

type PinActionResult =
  | { ok: true; dev?: boolean }
  | { ok: false; message: string; cooldown?: boolean; remaining?: number };

export type PinExtraField = { key: string; label: string; placeholder: string };

export default function PinSetup({
  title,
  description,
  confirmLabel = "Confirmar",
  extraFields = [],
  infoHint,
  send,
  confirm,
  onSuccess,
  onBack,
  cancelLabel = "Cancelar",
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  extraFields?: PinExtraField[];
  infoHint?: string;
  send: (payload: { pin: string; extra: Record<string, string> }) => Promise<PinActionResult>;
  confirm: (payload: { pin: string; code: string; extra: Record<string, string> }) => Promise<PinActionResult>;
  onSuccess: (pin: string) => void;
  onBack?: () => void;
  cancelLabel?: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [code, setCode] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>(() =>
    Object.fromEntries(extraFields.map((f) => [f.key, ""]))
  );
  const [message, setMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validatePins = (): string | null => {
    if (pin !== pin2) return "Los PIN no coinciden.";
    if (pin.length !== 4) return "El PIN tiene 4 dígitos.";
    for (const f of extraFields) {
      if (!extra[f.key]) return `Completá ${f.label.toLowerCase()}.`;
    }
    return null;
  };

  const submitCode = (page: 1 | 2) => {
    setMessage(null);
    setInfo(null);
    startTransition(async () => {
      const res = await send({ pin, extra });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setStep(page);
      setInfo(
        res.dev
          ? "Enviado a la consola del servidor (modo desarrollo)."
          : (infoHint ?? "Te enviamos un código por email. Revisá tu correo.")
      );
    });
  };

  const handleContinue = () => {
    const error = validatePins();
    if (error) {
      setMessage(error);
      return;
    }
    submitCode(2);
  };

  const handleConfirm = () => {
    if (code.length !== 6) {
      setMessage("El código tiene 6 dígitos.");
      return;
    }
    setMessage(null);
    setInfo(null);
    startTransition(async () => {
      const res = await confirm({ pin, code, extra });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      onSuccess(pin);
    });
  };

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-zinc-700">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>

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

      {step === 1 && (
        <div className="mt-4 space-y-3">
          {extraFields.map((f) => (
            <input
              key={f.key}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={extra[f.key]}
              onChange={(e) =>
                setExtra((prev) => ({ ...prev, [f.key]: e.target.value.replace(/\D/g, "") }))
              }
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-center outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Nuevo PIN"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-center outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
              placeholder="Repetí el PIN"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-center outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleContinue}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? "…" : "Continuar"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Código de 6 dígitos"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? "…" : confirmLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => submitCode(2)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ¿No te llegó? Enviar de nuevo
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setCode("");
              setMessage(null);
              setInfo(null);
            }}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← Volver a elegir PIN
          </button>
        </div>
      )}

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-sm text-zinc-500 hover:text-zinc-700"
        >
          {cancelLabel}
        </button>
      )}
    </div>
  );
}
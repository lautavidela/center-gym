"use server";

import { prisma } from "@/lib/prisma";
import { sendCodeEmail } from "@/lib/mail";
import {
  activeMembershipsArgs,
  buildConsultaView,
  clientRoutineArgs,
  recentPaymentsArgs,
  type ConsultaView,
} from "@/lib/consulta";
import { generateEmailCode, hashPassword, isValidPin, verifyPassword } from "@/lib/crypto";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;

type Attempts = { fails: number; lockedUntil: number };
const pinAttempts = new Map<string, Attempts>();
const sendCooldowns = new Map<string, number>();

function throttleKey(gymId: number, dni: string) {
  return `${gymId}:${dni}`;
}

function isLocked(key: string): boolean {
  const t = pinAttempts.get(key);
  if (!t) return false;
  if (t.lockedUntil > Date.now()) return true;
  if (t.fails === 0) pinAttempts.delete(key);
  return false;
}

function registerFail(key: string) {
  const t = pinAttempts.get(key) ?? { fails: 0, lockedUntil: 0 };
  t.fails += 1;
  if (t.fails >= MAX_ATTEMPTS) {
    t.lockedUntil = Date.now() + LOCK_MS;
    t.fails = 0;
  }
  pinAttempts.set(key, t);
}

async function findClient(gymId: number, rawDni: string) {
  const dni = rawDni.replace(/\D/g, "");
  if (!dni) return null;
  return prisma.client.findFirst({ where: { gymId, dni } });
}

async function getGym(gymId: number) {
  return prisma.gym.findUnique({ where: { id: gymId } });
}

type IssueCodeResult =
  | { ok: true; dev: boolean }
  | { ok: false; cooldown: true; remaining: number }
  | { ok: false; error?: string; dev?: boolean };

async function issueCode(
  gymId: number,
  clientId: number,
  purpose: string,
  to: string,
  gymName: string
): Promise<IssueCodeResult> {
  const cooldownKey = `${gymId}:${clientId}`;
  const lastSent = sendCooldowns.get(cooldownKey);
  if (lastSent && Date.now() - lastSent < SEND_COOLDOWN_MS) {
    const remaining = Math.ceil((SEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
    return { ok: false, cooldown: true, remaining };
  }
  const code = generateEmailCode();
  const codeHash = hashPassword(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  const existing = await prisma.emailCode.findFirst({
    where: { clientId, purpose, used: false, expiresAt: { gt: new Date() } },
  });
  if (existing) {
    await prisma.emailCode.delete({ where: { id: existing.id } });
  }
  await prisma.emailCode.create({
    data: { gymId, clientId, purpose, codeHash, expiresAt },
  });
  sendCooldowns.set(cooldownKey, Date.now());
  return sendCodeEmail({ to, gymName, code });
}

function cooldownMessage(sent: IssueCodeResult) {
  if ("cooldown" in sent)
    return `Esperá ${sent.remaining} segundo${sent.remaining === 1 ? "" : "s"} antes de pedir otro código.`;
  return null;
}

async function verifyCode(gymId: number, clientId: number, purpose: string, code: string) {
  const record = await prisma.emailCode.findFirst({
    where: { gymId, clientId, purpose, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;
  if (!verifyPassword(code, record.codeHash)) return false;
  await prisma.emailCode.update({ where: { id: record.id }, data: { used: true } });
  return true;
}

export type BuscarSocioResult =
  | { ok: false; message: string }
  | { ok: true; hasPin: boolean; name: string };

export async function buscarSocio(gymId: number, rawDni: string): Promise<BuscarSocioResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await findClient(gymId, rawDni);
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };

  return { ok: true, hasPin: !!client.pinHash, name: client.name };
}

export type BuscarSocioGlobalResult =
  | { ok: false; message: string }
  | {
      ok: true;
      gyms: {
        gymId: number;
        gymName: string;
        hasPin: boolean;
        clientName: string;
      }[];
    };

export async function buscarSocioGlobal(
  rawDni: string
): Promise<BuscarSocioGlobalResult> {
  const dni = rawDni.replace(/\D/g, "");
  if (!dni) return { ok: false, message: "Ingresá tu DNI para consultar." };

  const clients = await prisma.client.findMany({
    where: { dni },
    include: { gym: { select: { id: true, name: true } } },
  });

  if (clients.length === 0) {
    return {
      ok: false,
      message: "No encontramos un socio con ese DNI en ningún gimnasio.",
    };
  }

  return {
    ok: true,
    gyms: clients.map((c) => ({
      gymId: c.gym.id,
      gymName: c.gym.name,
      hasPin: !!c.pinHash,
      clientName: c.name,
    })),
  };
}

export type PinActionResult =
  | { ok: true; dev?: boolean }
  | { ok: false; message: string; cooldown?: boolean; remaining?: number };

export async function solicitarCodigoCrearPin(
  gymId: number,
  rawDni: string
): Promise<PinActionResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await findClient(gymId, rawDni);
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (client.pinHash) return { ok: false, message: "Ya tenés un PIN creado." };
  if (!client.email)
    return { ok: false, message: "Este socio no tiene email cargado. Pedíselo a la administración." };

  const sent = await issueCode(gym.id, client.id, "crear-pin", client.email, gym.name);
  if (!sent.ok) {
    return { ok: false, message: cooldownMessage(sent) ?? "No se pudo enviar el código. Intentalo de nuevo." };
  }
  return { ok: true, dev: sent.dev };
}

export async function confirmarCrearPin(
  gymId: number,
  rawDni: string,
  code: string,
  pin: string
): Promise<PinActionResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await findClient(gymId, rawDni);
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (client.pinHash) return { ok: false, message: "Ya tenés un PIN creado." };
  if (!isValidPin(pin))
    return { ok: false, message: "El PIN debe tener exactamente 4 dígitos numéricos." };

  const verified = await verifyCode(gym.id, client.id, "crear-pin", code);
  if (!verified) return { ok: false, message: "El código es incorrecto o está vencido." };

  await prisma.client.update({
    where: { id: client.id },
    data: { pinHash: hashPassword(pin) },
  });
  return { ok: true };
}

export type IngresarPinResult =
  | { ok: false; message: string; locked?: boolean }
  | { ok: true; clientId: number; view: ConsultaView };

export async function ingresarPin(
  gymId: number,
  rawDni: string,
  pin: string
): Promise<IngresarPinResult> {
  const key = throttleKey(gymId, rawDni.replace(/\D/g, ""));
  if (isLocked(key)) {
    return { ok: false, locked: true, message: "Demasiados intentos. Esperá un minuto." };
  }

  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await prisma.client.findFirst({
    where: { gymId, dni: rawDni.replace(/\D/g, "") },
    include: {
      gym: true,
      memberships: activeMembershipsArgs,
      payments: recentPaymentsArgs,
      routineExercises: clientRoutineArgs,
    },
  });
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (!client.pinHash) return { ok: false, message: "Todavía no creaste tu PIN." };

  if (!verifyPassword(pin, client.pinHash)) {
    registerFail(key);
    return { ok: false, message: "PIN incorrecto." };
  }

  pinAttempts.delete(key);
  const view = buildConsultaView(client);
  return { ok: true, clientId: client.id, view };
}

export async function solicitarCodigoCambiarPin(
  gymId: number,
  rawDni: string,
  currentPin: string
): Promise<PinActionResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await prisma.client.findFirst({
    where: { gymId, dni: rawDni.replace(/\D/g, "") },
  });
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (!client.pinHash) return { ok: false, message: "Todavía no creaste tu PIN." };
  if (!verifyPassword(currentPin, client.pinHash))
    return { ok: false, message: "El PIN actual es incorrecto." };
  if (!client.email)
    return { ok: false, message: "Este socio no tiene email cargado. Pedíselo a la administración." };

  const sent = await issueCode(gym.id, client.id, "cambiar-pin", client.email, gym.name);
  if (!sent.ok) {
    return { ok: false, message: cooldownMessage(sent) ?? "No se pudo enviar el código. Intentalo de nuevo." };
  }
  return { ok: true, dev: sent.dev };
}

export async function confirmarCambiarPin(
  gymId: number,
  rawDni: string,
  code: string,
  newPin: string
): Promise<PinActionResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await findClient(gymId, rawDni);
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (!client.pinHash) return { ok: false, message: "Todavía no creaste tu PIN." };
  if (!isValidPin(newPin))
    return { ok: false, message: "El PIN debe tener exactamente 4 dígitos numéricos." };

  const verified = await verifyCode(gym.id, client.id, "cambiar-pin", code);
  if (!verified) return { ok: false, message: "El código es incorrecto o está vencido." };

  await prisma.client.update({
    where: { id: client.id },
    data: { pinHash: hashPassword(newPin) },
  });
  return { ok: true };
}

export async function solicitarCodigoResetPin(
  gymId: number,
  rawDni: string
): Promise<PinActionResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await findClient(gymId, rawDni);
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (!client.pinHash) return { ok: false, message: "Todavía no creaste tu PIN." };
  if (!client.email)
    return { ok: false, message: "Este socio no tiene email cargado. Pedíselo a la administración." };

  const sent = await issueCode(gym.id, client.id, "reset-pin", client.email, gym.name);
  if (!sent.ok) {
    return { ok: false, message: cooldownMessage(sent) ?? "No se pudo enviar el código. Intentalo de nuevo." };
  }
  return { ok: true, dev: sent.dev };
}

export async function confirmarResetPin(
  gymId: number,
  rawDni: string,
  code: string,
  newPin: string
): Promise<PinActionResult> {
  const gym = await getGym(gymId);
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const client = await findClient(gymId, rawDni);
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (!client.pinHash) return { ok: false, message: "Todavía no creaste tu PIN." };
  if (!isValidPin(newPin))
    return { ok: false, message: "El PIN debe tener exactamente 4 dígitos numéricos." };

  const verified = await verifyCode(gym.id, client.id, "reset-pin", code);
  if (!verified) return { ok: false, message: "El código es incorrecto o está vencido." };

  await prisma.client.update({
    where: { id: client.id },
    data: { pinHash: hashPassword(newPin) },
  });
  return { ok: true };
}
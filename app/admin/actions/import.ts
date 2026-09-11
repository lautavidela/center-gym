"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  addDays,
  parseDni,
  parseExcelDate,
  startOfDay,
} from "@/lib/dates";

export type ImportMapping = {
  dni: string;
  nombre: string;
  telefono: string;
  email: string;
  plan: string;
  vencimiento: string;
};

export type ImportError = {
  row: number;
  dni: string | null;
  message: string;
};

export type ImportResult = {
  ok: boolean;
  total: number;
  imported: number;
  errorCount: number;
  errors: ImportError[];
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function cell(row: unknown[], index: string): string {
  const i = parseInt(index, 10);
  if (Number.isNaN(i) || i < 0 || i >= row.length) return "";
  const v = row[i];
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function isEmptyRow(row: unknown[]): boolean {
  return row.every((v) => v === null || v === undefined || String(v).trim() === "");
}

export async function importClients(
  rows: unknown[][],
  mapping: ImportMapping
): Promise<ImportResult> {
  await requireAdmin();

  const plans = await prisma.plan.findMany();
  const planIndex = new Map<string, number>();
  for (const p of plans) {
    const key = normalize(p.name);
    if (!planIndex.has(key)) planIndex.set(key, p.id);
  }

  const existingDnis = new Set<string>(
    (await prisma.client.findMany({
      where: { dni: { not: null } },
      select: { dni: true },
    }))
      .map((c) => c.dni as string)
      .map((d) => parseDni(d) ?? "")
      .filter(Boolean)
  );

  const seenInFile = new Set<string>();
  const today = startOfDay(new Date());

  const errors: ImportError[] = [];
  let imported = 0;
  let total = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    if (isEmptyRow(row)) continue;
    const excelRow = idx + 2;
    total++;

    const dni = parseDni(cell(row, mapping.dni));
    const name = cell(row, mapping.nombre);
    const phone = cell(row, mapping.telefono) || null;
    const email = cell(row, mapping.email) || null;
    const planName = cell(row, mapping.plan);
    const vencRaw = mapping.vencimiento ? cell(row, mapping.vencimiento) : "";

    if (!name) {
      errors.push({
        row: excelRow,
        dni,
        message: "Falta el nombre: la fila no se importa.",
      });
      continue;
    }

    let rowError: string | null = null;
    if (dni) {
      if (seenInFile.has(dni)) {
        rowError = "DNI duplicado dentro del archivo.";
      } else if (existingDnis.has(dni)) {
        rowError = "Ya existe un socio con ese DNI en el sistema.";
      }
      seenInFile.add(dni);
    }
    if (rowError) {
      errors.push({ row: excelRow, dni, message: rowError });
      continue;
    }

    const planKey = planName ? normalize(planName) : "";
    const planId = planKey ? (planIndex.get(planKey) ?? null) : null;
    const plan = planId ? plans.find((p) => p.id === planId) : null;

    const venc = mapping.vencimiento ? parseExcelDate(vencRaw) : null;

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (venc) {
      endDate = venc;
      startDate = plan ? addDays(venc, -plan.durationDays) : today;
    } else if (plan) {
      startDate = today;
      endDate = addDays(today, plan.durationDays);
    }

    const client = await prisma.client.create({
      data: { dni, name, phone, email },
    });

    if (startDate && endDate) {
      await prisma.membership.create({
        data: {
          clientId: client.id,
          planId: planId,
          startDate,
          endDate,
          isActive: true,
        },
      });
    }

    imported++;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/vencimientos");

  const errorCount = errors.length;
  return {
    ok: imported > 0 || errorCount === 0,
    total,
    imported,
    errorCount,
    errors: errors.slice(0, 100),
  };
}
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toDateKey } from "@/lib/dates";

export type AttendanceFormState = {
  error?: string;
  success?: boolean;
  clientName?: string;
};

export async function registerAttendance(
  clientId: number,
  _prev: AttendanceFormState,
  _formData: FormData
): Promise<AttendanceFormState> {
  await requireAdmin();

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "El cliente no existe." };

  const day = toDateKey(new Date());
  const existing = await prisma.attendance.findUnique({
    where: { clientId_day: { clientId, day } },
  });
  if (existing)
    return { error: `${client.name} ya registró asistencia hoy.` };

  await prisma.attendance.create({
    data: { clientId, day, dateTime: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/asistencias");
  return { success: true, clientName: client.name };
}

export async function removeAttendance(id: number) {
  await requireAdmin();
  await prisma.attendance.delete({ where: { id } });
  revalidatePath("/admin/asistencias");
}
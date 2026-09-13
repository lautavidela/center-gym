"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGymAdmin } from "@/lib/auth";
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
  const { gymId, gym } = await requireGymAdmin();

  const client = await prisma.client.findFirst({
    where: { id: clientId, gymId },
  });
  if (!client) return { error: "El cliente no existe." };

  const day = toDateKey(new Date());
  const existing = await prisma.attendance.findFirst({
    where: { clientId, day, gymId },
  });
  if (existing)
    return { error: `${client.name} ya registró asistencia hoy.` };

  await prisma.attendance.create({
    data: { clientId, gymId, day, dateTime: new Date() },
  });

  const base = `/g/${gym.slug}/admin`;
  revalidatePath(base);
  revalidatePath(`${base}/asistencias`);
  return { success: true, clientName: client.name };
}

export async function removeAttendance(id: number) {
  const { gymId, gym } = await requireGymAdmin();
  await prisma.attendance.deleteMany({ where: { id, gymId } });
  const base = `/g/${gym.slug}/admin`;
  revalidatePath(`${base}/asistencias`);
}
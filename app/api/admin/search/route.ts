import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { activeMembershipInclude } from "@/lib/membership";
import { computeStatus } from "@/lib/status";
import { formatDate, toDateKey } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const query = q.trim();
  if (!query) return NextResponse.json({ clients: [] });

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { dni: { contains: query, mode: "insensitive" } },
      ],
    },
    include: activeMembershipInclude,
    take: 8,
    orderBy: { name: "asc" },
  });

  const day = toDateKey(new Date());
  const todayAttendance = await prisma.attendance.findMany({ where: { day } });
  const alreadyToday = new Set(todayAttendance.map((a) => a.clientId));

  return NextResponse.json({
    clients: clients.map((c) => {
      const m = c.memberships[0];
      return {
        id: c.id,
        name: c.name,
        dni: c.dni,
        phone: c.phone,
        status: computeStatus(m?.endDate, c.isSuspended),
        plan: m?.plan?.name ?? null,
        endDate: m ? formatDate(m.endDate) : null,
        alreadyToday: alreadyToday.has(c.id),
      };
    }),
  });
}
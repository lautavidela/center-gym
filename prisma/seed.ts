import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/crypto";
import { addDays, toDateKey } from "../lib/dates";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@centergym.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: hashPassword(adminPassword) },
  });

  const planData = [
    { name: "Mensual", durationDays: 30, price: 25000 },
    { name: "Trimestral", durationDays: 90, price: 66000 },
    { name: "Anual", durationDays: 365, price: 240000 },
  ];

  const plans: Record<string, number> = {};
  for (const p of planData) {
    const existing = await prisma.plan.findFirst({ where: { name: p.name } });
    let plan = existing;
    if (!plan) {
      plan = await prisma.plan.create({ data: p });
    }
    plans[p.name] = plan.id;
  }

  const now = new Date();
  const sampleClients = [
    { dni: "30111222", name: "Juan Pérez", phone: "11 5555 1001", plan: "Mensual", offset: -10 },
    { dni: "27888999", name: "María González", phone: "11 5555 1002", plan: "Trimestral", offset: -40 },
    { dni: "33444555", name: "Carlos Rodríguez", phone: "11 5555 1003", plan: "Anual", offset: -120 },
    { dni: "35111222", name: "Lucía Fernández", phone: "11 5555 1004", plan: "Mensual", offset: -32 },
    { dni: "26999888", name: "Pedro Martínez", phone: "11 5555 1005", plan: "Trimestral", offset: -70 },
    { dni: "29888777", name: "Sofía López", phone: "11 5555 1006", plan: "Mensual", offset: -2 },
    { dni: "31111222", name: "Lucas Díaz", phone: "11 5555 1007", plan: "Mensual", offset: -8 },
    { dni: "35888999", name: "Valentina Torres", phone: "11 5555 1008", plan: "Anual", offset: -200 },
    { dni: "27444555", name: "Martín Sosa", phone: "11 5555 1009", plan: "Mensual", offset: -25 },
  ];

  for (const c of sampleClients) {
    const existing = await prisma.client.findUnique({ where: { dni: c.dni } });
    if (existing) continue;

    const client = await prisma.client.create({
      data: {
        dni: c.dni,
        name: c.name,
        phone: c.phone,
      },
    });

    const planId = plans[c.plan];
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) continue;

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + c.offset,
      12,
      0,
      0,
      0
    );
    const endDate = addDays(startDate, plan.durationDays);

    const membership = await prisma.membership.create({
      data: {
        clientId: client.id,
        planId: plan.id,
        startDate,
        endDate,
        isActive: true,
      },
    });

    await prisma.payment.create({
      data: {
        clientId: client.id,
        planId: plan.id,
        membershipId: membership.id,
        amount: plan.price,
        method: "efectivo",
        paidAt: startDate,
        notes: "Alta inicial",
      },
    });

    if (c.offset > -7) {
      await prisma.attendance.create({
        data: { clientId: client.id, day: toDateKey(now), dateTime: now },
      }).catch(() => undefined);
    }
  }

  console.log("Seed listo. Admin:", adminEmail, "| Clientes:", sampleClients.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
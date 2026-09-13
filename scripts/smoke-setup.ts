import { PrismaClient } from "@prisma/client";
import { sealData } from "iron-session";
import { hashPassword } from "../lib/crypto";

const prisma = new PrismaClient();
const SESSION_SECRET = process.env.SESSION_SECRET!;

async function main() {
  const slug = "palermo";
  let gym = await prisma.gym.findUnique({ where: { slug } });
  if (!gym) {
    gym = await prisma.gym.create({
      data: { slug, name: "Power Gym Palermo" },
    });
    await prisma.user.create({
      data: {
        email: "palermo@gimnasio.com",
        passwordHash: hashPassword("palermo123"),
        gymId: gym.id,
        isSuperAdmin: false,
      },
    });
    await prisma.plan.createMany({
      data: [
        { gymId: gym.id, name: "Mensual 3 días", classesPerMonth: 12, price: 25000 },
        { gymId: gym.id, name: "Mensual todos los días", classesPerMonth: 20, price: 30000 },
      ],
    });
  }

  const dup = await prisma.client.findFirst({ where: { gymId: gym.id, dni: "30111222" } });
  if (!dup) {
    await prisma.client.create({
      data: { gymId: gym.id, dni: "30111222", name: "Roberto DNI Igual" },
    });
  }
  const solo = await prisma.client.findFirst({ where: { gymId: gym.id, dni: "40999111" } });
  if (!solo) {
    await prisma.client.create({
      data: { gymId: gym.id, dni: "40999111", name: "Cliente Solo Palermo" },
    });
  }

  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: "lautaro@admin.com" },
  });
  const palermoUser = await prisma.user.findUniqueOrThrow({
    where: { email: "palermo@gimnasio.com" },
  });
  const centerUser = await prisma.user.findUniqueOrThrow({
    where: { email: "admin@centergym.com" },
  });

  const adminSeal = await sealData(
    { userId: admin.id, email: admin.email },
    { password: SESSION_SECRET }
  );
  const palermoSeal = await sealData(
    { userId: palermoUser.id, email: palermoUser.email },
    { password: SESSION_SECRET }
  );
  const centerSeal = await sealData(
    { userId: centerUser.id, email: centerUser.email },
    { password: SESSION_SECRET }
  );

  console.log("ADMIN_SEAL=" + adminSeal);
  console.log("PALERMO_SEAL=" + palermoSeal);
  console.log("CENTER_SEAL=" + centerSeal);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/crypto";

const prisma = new PrismaClient();

async function main() {
  const lautaroPassword = process.env.LAUTARO_PASSWORD || "admin123";

  const renamed = await prisma.gym.updateMany({
    where: { slug: "tu-gym" },
    data: { slug: "center-gym", name: "Center Gym" },
  });
  console.log(renamed.count > 0 ? "Gym tu-gym -> center-gym (Center Gym)" : "center-gym ya estaba actualizado");

  await prisma.gym.upsert({
    where: { slug: "center-gym" },
    update: { name: "Center Gym" },
    create: { slug: "center-gym", name: "Center Gym" },
  });

  const centerUser = await prisma.user.update({
    where: { email: "admin@centergym.com" },
    data: { isSuperAdmin: false },
  });
  console.log("admin@centergym.com -> admin normal de", centerUser.gymId);

  await prisma.user.upsert({
    where: { email: "lautaro@admin.com" },
    update: {
      isSuperAdmin: true,
      gymId: null,
      passwordHash: hashPassword(lautaroPassword),
    },
    create: {
      email: "lautaro@admin.com",
      passwordHash: hashPassword(lautaroPassword),
      isSuperAdmin: true,
      gymId: null,
    },
  });
  console.log("lautaro@admin.com -> superadmin sin gym (password:", lautaroPassword + ")");

  const palermo = await prisma.gym.findUnique({ where: { slug: "palermo" } });
  console.log("palermo intacto:", palermo ? `${palermo.name}` : "NO EXISTE");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.update({
    where: { email: "lautaro@admin.com" },
    data: { isSuperAdmin: true, gymId: null },
  });
  console.log("Superadmin:", admin.email, "| gymId:", admin.gymId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
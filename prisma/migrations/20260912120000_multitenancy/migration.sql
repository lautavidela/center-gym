-- Multitenancy: cada gym tiene sus propios datos (clientes, planes, pagos, asistencias).

-- CreateTable Gym
CREATE TABLE "Gym" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Gym_slug_key" ON "Gym"("slug");

-- Gimnasio por defecto: absorbe los datos existentes (el gym del dueño de la plataforma).
INSERT INTO "Gym" ("slug", "name")
VALUES ('tu-gym', 'Mi gym')
ON CONFLICT ("slug") DO NOTHING;

-- Nuevas columnas (nullable primero para poder backfillar)
ALTER TABLE "User" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "User" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "Client" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "Membership" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "Attendance" ADD COLUMN "gymId" INTEGER;

-- Backfill: todos los datos existentes van al gym por defecto.
UPDATE "User"       SET "gymId" = (SELECT "id" FROM "Gym" WHERE "slug" = 'tu-gym');
UPDATE "Plan"       SET "gymId" = (SELECT "id" FROM "Gym" WHERE "slug" = 'tu-gym');
UPDATE "Client"     SET "gymId" = (SELECT "id" FROM "Gym" WHERE "slug" = 'tu-gym');
UPDATE "Membership" SET "gymId" = (SELECT "id" FROM "Gym" WHERE "slug" = 'tu-gym');
UPDATE "Payment"    SET "gymId" = (SELECT "id" FROM "Gym" WHERE "slug" = 'tu-gym');
UPDATE "Attendance" SET "gymId" = (SELECT "id" FROM "Gym" WHERE "slug" = 'tu-gym');

-- NOT NULL
ALTER TABLE "User"       ALTER COLUMN "gymId" SET NOT NULL;
ALTER TABLE "Plan"       ALTER COLUMN "gymId" SET NOT NULL;
ALTER TABLE "Client"     ALTER COLUMN "gymId" SET NOT NULL;
ALTER TABLE "Membership" ALTER COLUMN "gymId" SET NOT NULL;
ALTER TABLE "Payment"    ALTER COLUMN "gymId" SET NOT NULL;
ALTER TABLE "Attendance" ALTER COLUMN "gymId" SET NOT NULL;

-- Unicates globales → únicos por gym
DROP INDEX IF EXISTS "Client_dni_key";
CREATE UNIQUE INDEX "Client_gymId_dni_key" ON "Client"("gymId", "dni");
CREATE UNIQUE INDEX "Plan_gymId_name_key" ON "Plan"("gymId", "name");

-- Foreign keys a Gym
ALTER TABLE "User"       ADD CONSTRAINT "User_gymId_fkey"       FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Plan"       ADD CONSTRAINT "Plan_gymId_fkey"       FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Client"     ADD CONSTRAINT "Client_gymId_fkey"     FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment"    ADD CONSTRAINT "Payment_gymId_fkey"    FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Índices de lookups por gym
CREATE INDEX "User_gymId_idx"       ON "User"("gymId");
CREATE INDEX "Plan_gymId_idx"       ON "Plan"("gymId");
CREATE INDEX "Client_gymId_idx"     ON "Client"("gymId");
CREATE INDEX "Membership_gymId_idx" ON "Membership"("gymId");
CREATE INDEX "Payment_gymId_idx"    ON "Payment"("gymId");
CREATE INDEX "Attendance_gymId_idx" ON "Attendance"("gymId");
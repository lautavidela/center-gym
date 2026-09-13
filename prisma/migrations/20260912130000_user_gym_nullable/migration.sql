-- Los superadmin (dueños de la plataforma) no pertenecen a ningún gym.
ALTER TABLE "User" ALTER COLUMN "gymId" DROP NOT NULL;
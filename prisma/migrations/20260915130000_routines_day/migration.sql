-- AlterTable
ALTER TABLE "RoutineExercise" ADD COLUMN "day" INTEGER NOT NULL DEFAULT 0;

-- DropIndex
DROP INDEX "RoutineExercise_clientId_exerciseId_key";

-- CreateIndex
CREATE UNIQUE INDEX "RoutineExercise_clientId_day_exerciseId_key" ON "RoutineExercise"("clientId", "day", "exerciseId");
-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscle" TEXT,
    "bodyPart" TEXT,
    "equipment" TEXT,
    "gifUrl" TEXT NOT NULL,
    "instructions" TEXT,
    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineExercise" (
    "id" SERIAL NOT NULL,
    "gymId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" TEXT NOT NULL DEFAULT '12',
    "rest" TEXT NOT NULL DEFAULT '60',
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoutineExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoutineExercise_clientId_exerciseId_key" ON "RoutineExercise"("clientId", "exerciseId");

-- CreateIndex
CREATE INDEX "RoutineExercise_gymId_fkey" ON "RoutineExercise"("gymId");

-- CreateIndex
CREATE INDEX "RoutineExercise_clientId_fkey" ON "RoutineExercise"("clientId");

-- CreateIndex
CREATE INDEX "RoutineExercise_exerciseId_fkey" ON "RoutineExercise"("exerciseId");

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
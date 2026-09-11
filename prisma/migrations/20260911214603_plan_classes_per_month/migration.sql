/*
  Warnings:

  - You are about to drop the column `durationDays` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `classesPerMonth` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "durationDays",
ADD COLUMN     "classesPerMonth" INTEGER NOT NULL;

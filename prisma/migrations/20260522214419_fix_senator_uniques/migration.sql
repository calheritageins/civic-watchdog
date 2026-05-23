/*
  Warnings:

  - A unique constraint covering the columns `[stateCode,district,chamber,fullName]` on the table `Representative` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Representative_stateCode_district_chamber_key";

-- AlterTable
ALTER TABLE "Representative" ADD COLUMN     "bioguideId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Representative_stateCode_district_chamber_fullName_key" ON "Representative"("stateCode", "district", "chamber", "fullName");

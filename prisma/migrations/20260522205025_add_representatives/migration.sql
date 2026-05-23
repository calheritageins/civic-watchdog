-- CreateTable
CREATE TABLE "Representative" (
    "id" SERIAL NOT NULL,
    "stateCode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "chamber" TEXT NOT NULL,
    "party" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Representative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Representative_stateCode_district_chamber_key" ON "Representative"("stateCode", "district", "chamber");

-- CreateTable
CREATE TABLE "RepresentativeBillVote" (
    "id" SERIAL NOT NULL,
    "representativeId" INTEGER NOT NULL,
    "billId" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepresentativeBillVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepresentativeBillVote_representativeId_billId_key" ON "RepresentativeBillVote"("representativeId", "billId");

-- AddForeignKey
ALTER TABLE "RepresentativeBillVote" ADD CONSTRAINT "RepresentativeBillVote_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "Representative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepresentativeBillVote" ADD CONSTRAINT "RepresentativeBillVote_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

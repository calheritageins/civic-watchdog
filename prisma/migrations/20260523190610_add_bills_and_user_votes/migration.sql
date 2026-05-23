-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "congress" INTEGER NOT NULL,
    "billType" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBillVote" (
    "id" SERIAL NOT NULL,
    "userAddressId" INTEGER NOT NULL,
    "billId" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBillVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_congress_billType_billNumber_key" ON "Bill"("congress", "billType", "billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserBillVote_userAddressId_billId_key" ON "UserBillVote"("userAddressId", "billId");

-- AddForeignKey
ALTER TABLE "UserBillVote" ADD CONSTRAINT "UserBillVote_userAddressId_fkey" FOREIGN KEY ("userAddressId") REFERENCES "UserAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBillVote" ADD CONSTRAINT "UserBillVote_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  const vote = await prisma.userBillVote.upsert({
    where: {
      userAddressId_billId: {
        userAddressId: body.userAddressId,
        billId: body.billId,
      },
    },
    update: {
      position: body.position,
    },
    create: {
      userAddressId: body.userAddressId,
      billId: body.billId,
      position: body.position,
    },
  });

  return NextResponse.json({
    message: "Vote saved successfully.",
    vote,
  });
}
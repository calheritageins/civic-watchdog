import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  const bills = await prisma.bill.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    bills,
  });
}
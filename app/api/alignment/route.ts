import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function userMatchesRep(userPosition: string, repPosition: string) {
  if (userPosition === "Support" && repPosition === "Yea") return true;
  if (userPosition === "Support" && repPosition === "Support") return true;

  if (userPosition === "Oppose" && repPosition === "Nay") return true;
  if (userPosition === "Oppose" && repPosition === "Oppose") return true;

  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAddressId = Number(searchParams.get("userAddressId"));

  if (!userAddressId) {
    return NextResponse.json(
      { error: "Missing userAddressId" },
      { status: 400 }
    );
  }

  const userAddress = await prisma.userAddress.findUnique({
    where: { id: userAddressId },
  });

  if (!userAddress?.stateCode || !userAddress?.congressionalDistrict) {
    return NextResponse.json(
      { error: "User district not found" },
      { status: 404 }
    );
  }

  const stateMap: Record<string, string> = {
    "06": "CA",
  };

  const stateAbbr = stateMap[userAddress.stateCode];

  const representative = await prisma.representative.findFirst({
    where: {
      stateCode: stateAbbr,
      district: userAddress.congressionalDistrict,
      chamber: "House",
    },
  });

  if (!representative) {
    return NextResponse.json(
      { error: "Representative not found" },
      { status: 404 }
    );
  }

  const userVotes = await prisma.userBillVote.findMany({
    where: {
      userAddressId,
      position: {
        not: "Unsure",
      },
    },
  });

  let comparableVotes = 0;
  let matchingVotes = 0;

  const comparisons = [];

  for (const userVote of userVotes) {
    const repVote = await prisma.representativeBillVote.findUnique({
      where: {
        representativeId_billId: {
          representativeId: representative.id,
          billId: userVote.billId,
        },
      },
      include: {
        bill: true,
      },
    });

    if (!repVote) continue;

    comparableVotes++;

    const matched = userMatchesRep(userVote.position, repVote.position);

    if (matched) matchingVotes++;

    comparisons.push({
      billId: userVote.billId,
      billTitle: repVote.bill.title,
      userPosition: userVote.position,
      representativePosition: repVote.position,
      matched,
    });
  }

  const alignmentPercent =
    comparableVotes === 0
      ? null
      : Math.round((matchingVotes / comparableVotes) * 100);

  return NextResponse.json({
    representative,
    comparableVotes,
    matchingVotes,
    alignmentPercent,
    comparisons,
  });
}
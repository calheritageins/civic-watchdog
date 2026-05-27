import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function userMatchesRep(userPosition: string, repPosition: string) {
  if (
    userPosition === "Support" &&
    (repPosition === "Yea" || repPosition === "Support")
  ) {
    return true;
  }

  if (
    userPosition === "Oppose" &&
    (repPosition === "Nay" || repPosition === "Oppose")
  ) {
    return true;
  }

  return false;
}

async function calculateAlignment(
  representativeId: number,
  userProfileId: number
) {
  const representative = await prisma.representative.findUnique({
    where: {
      id: representativeId,
    },
  });

  if (!representative) return null;

  const userVotes = await prisma.userBillVote.findMany({
    where: {
      userProfileId,
      position: {
        not: "Unsure",
      },
    },
  });

  const totalTrackedBills = await prisma.representativeBillVote.count({
    where: {
      representativeId,
    },
  });

  let comparableVotes = 0;
  let matchingVotes = 0;

  for (const userVote of userVotes) {
    const repVote = await prisma.representativeBillVote.findUnique({
      where: {
        representativeId_billId: {
          representativeId: representative.id,
          billId: userVote.billId,
        },
      },
    });

    if (!repVote) continue;

    comparableVotes++;

    const matched = userMatchesRep(userVote.position, repVote.position);

    if (matched) matchingVotes++;
  }

  const alignmentPercent =
    comparableVotes === 0
      ? 0
      : Math.round((matchingVotes / comparableVotes) * 100);

  const participationPercent =
    totalTrackedBills === 0
      ? 0
      : Math.round((comparableVotes / totalTrackedBills) * 100);

  return {
    representative,
    comparableVotes,
    matchingVotes,
    alignmentPercent,
    participationPercent,
    totalTrackedBills,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const latestAddress = await prisma.userAddress.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestAddress?.stateCode || !latestAddress?.congressionalDistrict) {
      return NextResponse.json(
        { error: "District not found" },
        { status: 404 }
      );
    }

    const stateMap: Record<string, string> = {
      "06": "CA",
    };

    const stateAbbr = stateMap[latestAddress.stateCode];

    const representatives = await prisma.representative.findMany({
      where: {
        OR: [
          {
            chamber: "House",
            stateCode: stateAbbr,
            district: latestAddress.congressionalDistrict,
          },
          {
            chamber: "Senate",
            stateCode: stateAbbr,
          },
        ],
      },
    });

    const alignments = [];

    for (const rep of representatives) {
      const alignment = await calculateAlignment(rep.id, userProfile.id);

      if (alignment) {
        alignments.push(alignment);
      }
    }

    return NextResponse.json({
      alignments,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Alignment API failed",
      },
      { status: 500 }
    );
  }
}
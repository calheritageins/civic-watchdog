import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function userMatchesRep(
  userPosition: string,
  repPosition: string
) {
  if (
    userPosition === "Support" &&
    (repPosition === "Yea" ||
      repPosition === "Support")
  ) {
    return true;
  }

  if (
    userPosition === "Oppose" &&
    (repPosition === "Nay" ||
      repPosition === "Oppose")
  ) {
    return true;
  }

  return false;
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

    const userProfile =
      await prisma.userProfile.findUnique({
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

    const latestAddress =
      await prisma.userAddress.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      });

    if (
      !latestAddress?.stateCode ||
      !latestAddress?.congressionalDistrict
    ) {
      return NextResponse.json(
        { error: "District not found" },
        { status: 404 }
      );
    }

    const stateMap: Record<string, string> = {
      "06": "CA",
    };

    const stateAbbr =
      stateMap[latestAddress.stateCode];

    const representative =
      await prisma.representative.findFirst({
        where: {
          stateCode: stateAbbr,
          district:
            latestAddress.congressionalDistrict,
          chamber: "House",
        },
      });

    if (!representative) {
      return NextResponse.json(
        { error: "Representative not found" },
        { status: 404 }
      );
    }

    const userVotes =
      await prisma.userBillVote.findMany({
        where: {
          userProfileId: userProfile.id,
          position: {
            not: "Unsure",
          },
        },
      });

    let comparableVotes = 0;
    let matchingVotes = 0;

    const comparisons = [];

    for (const userVote of userVotes) {
      const repVote =
        await prisma.representativeBillVote.findUnique({
          where: {
            representativeId_billId: {
              representativeId:
                representative.id,
              billId: userVote.billId,
            },
          },
          include: {
            bill: true,
          },
        });

      if (!repVote) continue;

      comparableVotes++;

      const matched = userMatchesRep(
        userVote.position,
        repVote.position
      );

      if (matched) matchingVotes++;

      comparisons.push({
        billId: userVote.billId,
        billTitle: repVote.bill.title,
        userPosition: userVote.position,
        representativePosition:
          repVote.position,
        matched,
      });
    }

    const alignmentPercent =
      comparableVotes === 0
        ? 0
        : Math.round(
            (matchingVotes /
              comparableVotes) *
              100
          );

    return NextResponse.json({
      representative,
      comparableVotes,
      matchingVotes,
      alignmentPercent,
      comparisons,
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
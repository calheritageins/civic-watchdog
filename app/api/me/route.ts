import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const stateMap: Record<string, string> = {
  "06": "CA",
};

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
      return NextResponse.json({
        userProfile: null,
      });
    }

    const latestAddress =
      await prisma.userAddress.findFirst({
        where: {
          userProfileId: userProfile.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!latestAddress) {
      return NextResponse.json({
        userProfile,
        latestAddress: null,
      });
    }

    const stateAbbr =
      stateMap[latestAddress.stateCode || ""];

    const representative =
      await prisma.representative.findFirst({
        where: {
          chamber: "House",
          stateCode: stateAbbr,
          district:
            latestAddress.congressionalDistrict,
        },
      });

    const senators =
      await prisma.representative.findMany({
        where: {
          chamber: "Senate",
          stateCode: stateAbbr,
        },
      });

    const votes =
      await prisma.userBillVote.findMany({
        where: {
          userProfileId: userProfile.id,
        },
      });

    return NextResponse.json({
      userProfile,
      latestAddress,
      representative,
      senators,
      votes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}
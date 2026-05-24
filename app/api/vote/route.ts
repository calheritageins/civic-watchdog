import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    const body = await request.json();

    if (!body.billId || !body.position) {
      return NextResponse.json(
        { error: "Missing billId or position." },
        { status: 400 }
      );
    }

    let userProfile = await prisma.userProfile.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          clerkId: userId,
          email:
            clerkUser?.emailAddresses?.[0]?.emailAddress ||
            null,
          fullName:
            `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() ||
            null,
        },
      });
    }

    const savedVote =
      await prisma.userBillVote.upsert({
        where: {
          userProfileId_billId: {
            userProfileId: userProfile.id,
            billId: Number(body.billId),
          },
        },
        update: {
          position: body.position,
        },
        create: {
          userProfileId: userProfile.id,
          billId: Number(body.billId),
          position: body.position,
        },
      });

    return NextResponse.json({
      message: "Vote saved successfully.",
      savedVote,
    });
  } catch (error) {
    console.error("Vote API error:", error);

    return NextResponse.json(
      {
        error: "Vote API failed.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
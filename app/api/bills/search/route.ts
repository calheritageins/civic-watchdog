import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { userId } = await auth();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const billType = searchParams.get("billType") || "";
  const unvotedOnly = searchParams.get("unvotedOnly") !== "false";

  let userProfile = null;

  if (userId) {
    userProfile = await prisma.userProfile.findUnique({
      where: {
        clerkId: userId,
      },
    });
  }

  const userVotes = userProfile
    ? await prisma.userBillVote.findMany({
        where: {
          userProfileId: userProfile.id,
        },
      })
    : [];

  const votedBillIds = userVotes.map((vote) => vote.billId);

  const bills = await prisma.bill.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  summary: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        status
          ? {
              status: {
                contains: status,
                mode: "insensitive",
              },
            }
          : {},
        billType ? { billType } : {},
        unvotedOnly && votedBillIds.length
          ? {
              id: {
                notIn: votedBillIds,
              },
            }
          : {},
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const votesByBillId: Record<number, string> = {};

  for (const vote of userVotes) {
    votesByBillId[vote.billId] = vote.position;
  }

  return NextResponse.json({
    bills: bills.map((bill) => ({
      ...bill,
      userVote: votesByBillId[bill.id] || null,
    })),
  });
}
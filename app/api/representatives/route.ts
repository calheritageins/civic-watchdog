import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const states = (searchParams.get("state") || "")
  .split(",")
  .filter(Boolean);

const chambers = (searchParams.get("chamber") || "")
  .split(",")
  .filter(Boolean);

const parties = (searchParams.get("party") || "")
  .split(",")
  .filter(Boolean);

  const representatives = await prisma.representative.findMany({
    where: {
      AND: [
        search
          ? {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
        states.length ? { stateCode: { in: states } } : {},
chambers.length ? { chamber: { in: chambers } } : {},
parties.length ? { party: { in: parties } } : {},
      ],
    },
    orderBy: [
      { stateCode: "asc" },
      { chamber: "asc" },
      { district: "asc" },
    ],
    take: 200,
  });

  return NextResponse.json({
    representatives,
  });
}
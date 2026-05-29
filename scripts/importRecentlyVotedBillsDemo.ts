import "dotenv/config";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const CURRENT_CONGRESS = 119;

async function run() {
  console.log("Fetching recently active bills...");

  const response = await axios.get(
    `https://api.congress.gov/v3/bill/${CURRENT_CONGRESS}?format=json&limit=25&sort=updateDate+desc&api_key=${process.env.CONGRESS_API_KEY}`,
    {
      headers: {
        "User-Agent": "Civic Watchdog Demo Importer",
      },
    }
  );

  const bills = response.data?.bills || [];

  const reps = await prisma.representative.findMany({
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Found ${reps.length} representatives to seed votes for.`);

  for (const bill of bills) {
    const billType = String(bill.type || "").toUpperCase();

    if (!["HR", "S"].includes(billType)) continue;

    const savedBill = await prisma.bill.upsert({
      where: {
        congress_billType_billNumber: {
          congress: Number(bill.congress),
          billType,
          billNumber: String(bill.number),
        },
      },
      update: {
        title: bill.title || "Untitled Bill",
        status: bill.latestAction?.text || null,
        sourceUrl: bill.url || null,
      },
      create: {
        congress: Number(bill.congress),
        billType,
        billNumber: String(bill.number),
        title: bill.title || "Untitled Bill",
        summary: null,
        status: bill.latestAction?.text || null,
        sourceUrl: bill.url || null,
      },
    });

    console.log(`Imported ${billType} ${bill.number}`);

    for (const rep of reps) {
      let position = "Yea";

if (rep.fullName.includes("Schiff")) position = "Yea";
if (rep.fullName.includes("Padilla")) position = "Nay";
if (rep.fullName.includes("Carbajal")) position = "Yea";

      await prisma.representativeBillVote.upsert({
        where: {
          representativeId_billId: {
            representativeId: rep.id,
            billId: savedBill.id,
          },
        },
        update: {
          position,
        },
        create: {
          representativeId: rep.id,
          billId: savedBill.id,
          position,
        },
      });
    }

    console.log(`Seeded demo votes for ${billType} ${bill.number}`);
  }

  console.log("Done importing recently voted demo bills.");
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
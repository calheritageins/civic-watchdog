import "dotenv/config";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Fetching recent bills...");

const response = await axios.get(
  `https://api.congress.gov/v3/bill?format=json&limit=10&api_key=${process.env.CONGRESS_API_KEY}`,
    {
      headers: {
        "User-Agent": "Civic Watchdog Prototype",
      },
    }
  );

  const bills = response.data.bills || [];

  for (const bill of bills) {
    await prisma.bill.upsert({
      where: {
        congress_billType_billNumber: {
          congress: Number(bill.congress),
          billType: bill.type,
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
        billType: bill.type,
        billNumber: String(bill.number),
        title: bill.title || "Untitled Bill",
        summary: null,
        status: bill.latestAction?.text || null,
        sourceUrl: bill.url || null,
      },
    });

    console.log(
      `Imported ${bill.type} ${bill.number}: ${bill.title}`
    );
  }

  console.log("Done importing bills.");
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
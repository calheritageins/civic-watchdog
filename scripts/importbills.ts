import "dotenv/config";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const CURRENT_CONGRESS = 119;

const ALLOWED_BILL_TYPES = ["HR", "S"];

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

async function run() {
  console.log("Fetching recent current bills...");

  const fromDate = getDateDaysAgo(90);

  const response = await axios.get(
    `https://api.congress.gov/v3/bill/${CURRENT_CONGRESS}?format=json&limit=50&fromDateTime=${fromDate}T00:00:00Z&sort=updateDate+desc&api_key=${process.env.CONGRESS_API_KEY}`,
    {
      headers: {
        "User-Agent": "Civic Watchdog Prototype",
      },
    }
  );

  const bills = response.data.bills || [];

  let importedCount = 0;
  let skippedCount = 0;

  for (const bill of bills) {
    const billType = String(bill.type || "").toUpperCase();

    if (!ALLOWED_BILL_TYPES.includes(billType)) {
      skippedCount++;
      console.log(`Skipped ${bill.type} ${bill.number}: unsupported bill type`);
      continue;
    }

    if (!bill.title) {
      skippedCount++;
      console.log(`Skipped ${bill.type} ${bill.number}: missing title`);
      continue;
    }

    await prisma.bill.upsert({
      where: {
        congress_billType_billNumber: {
          congress: Number(bill.congress),
          billType,
          billNumber: String(bill.number),
        },
      },
      update: {
        title: bill.title,
        status: bill.latestAction?.text || null,
        sourceUrl: bill.url || null,
      },
      create: {
        congress: Number(bill.congress),
        billType,
        billNumber: String(bill.number),
        title: bill.title,
        summary: null,
        status: bill.latestAction?.text || null,
        sourceUrl: bill.url || null,
      },
    });

    importedCount++;

    console.log(`Imported ${billType} ${bill.number}: ${bill.title}`);
  }

  console.log("Done importing bills.");
  console.log(`Imported: ${importedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
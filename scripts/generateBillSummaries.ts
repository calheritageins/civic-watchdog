import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function run() {
  const bills = await prisma.bill.findMany({
    where: {
      aiSummary: null,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`Found ${bills.length} bills without AI summaries.`);

  for (const bill of bills) {
    const prompt = `
You are summarizing legislation for a neutral civic transparency platform.

Do not persuade. Do not take a political position.
Explain the bill in plain English for an average citizen.

Bill:
${bill.billType} ${bill.billNumber}
Title: ${bill.title}
Status: ${bill.status || "Unknown"}
Existing summary: ${bill.summary || "None"}

Return:
1. Plain English Summary
2. What this bill appears to do
3. Who may be affected
4. Important note: this is AI-assisted and users should read the official source
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiSummary = result.text || "No AI summary generated.";

    await prisma.bill.update({
      where: {
        id: bill.id,
      },
      data: {
        aiSummary,
        aiGeneratedAt: new Date(),
      },
    });

    console.log(`Generated AI summary for ${bill.billType} ${bill.billNumber}`);
  }

  console.log("Done generating AI summaries.");
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
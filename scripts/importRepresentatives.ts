import "dotenv/config";
import axios from "axios";
import YAML from "yaml";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

type Legislator = {
  id?: {
    bioguide?: string;
  };
  name: {
    first?: string;
    middle?: string;
    last?: string;
    official_full?: string;
  };
  terms: {
    type: "rep" | "sen";
    state: string;
    district?: number;
    party?: string;
    url?: string;
    phone?: string;
  }[];
};

function getFullName(person: Legislator) {
  return (
    person.name.official_full ||
    [person.name.first, person.name.middle, person.name.last]
      .filter(Boolean)
      .join(" ")
  );
}

async function run() {
  console.log("Fetching current legislators...");

  const response = await axios.get(
    "https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.yaml"
  );

  const legislators = YAML.parse(response.data) as Legislator[];

  let importedHouse = 0;
  let importedSenate = 0;

  for (const person of legislators) {
    const currentTerm = person.terms[person.terms.length - 1];
    if (!currentTerm) continue;

    const fullName = getFullName(person);
    const bioguideId = person.id?.bioguide || null;

    if (currentTerm.type === "rep") {
      const district =
        currentTerm.district != null
          ? String(currentTerm.district)
          : "0";

      await prisma.representative.upsert({
        where: {
          stateCode_district_chamber_fullName: {
            stateCode: currentTerm.state,
            district,
            chamber: "House",
            fullName,
          },
        },
        update: {
          party: currentTerm.party || null,
          website: currentTerm.url || null,
          phone: currentTerm.phone || null,
          bioguideId,
        },
        create: {
          stateCode: currentTerm.state,
          district,
          chamber: "House",
          fullName,
          party: currentTerm.party || null,
          website: currentTerm.url || null,
          phone: currentTerm.phone || null,
          bioguideId,
        },
      });

      importedHouse++;
    }

    if (currentTerm.type === "sen") {
      await prisma.representative.upsert({
        where: {
          stateCode_district_chamber_fullName: {
            stateCode: currentTerm.state,
            district: "STATEWIDE",
            chamber: "Senate",
            fullName,
          },
        },
        update: {
          party: currentTerm.party || null,
          website: currentTerm.url || null,
          phone: currentTerm.phone || null,
          bioguideId,
        },
        create: {
          stateCode: currentTerm.state,
          district: "STATEWIDE",
          chamber: "Senate",
          fullName,
          party: currentTerm.party || null,
          website: currentTerm.url || null,
          phone: currentTerm.phone || null,
          bioguideId,
        },
      });

      importedSenate++;
    }
  }

  console.log(
    `Done. Imported ${importedHouse} House members and ${importedSenate} Senators.`
  );
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
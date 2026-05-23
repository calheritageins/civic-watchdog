import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  const street = encodeURIComponent(body.address1);
  const city = encodeURIComponent(body.city);
  const state = encodeURIComponent(body.state);
  const zip = encodeURIComponent(body.zip);

  const censusUrl =
    `https://geocoding.geo.census.gov/geocoder/geographies/address` +
    `?street=${street}` +
    `&city=${city}` +
    `&state=${state}` +
    `&zip=${zip}` +
    `&benchmark=Public_AR_Current` +
    `&vintage=Current_Current` +
    `&format=json`;

  const censusResponse = await fetch(censusUrl);
  const censusData = await censusResponse.json();

  console.log(JSON.stringify(censusData, null, 2));

  let matchedAddress: string | null = null;
  let congressionalDistrict: string | null = null;
  let stateCode: string | null = null;

  const matches = censusData?.result?.addressMatches || [];

  if (matches.length > 0) {
    const firstMatch = matches[0];

    matchedAddress = firstMatch.matchedAddress || null;

    const geographies = firstMatch?.geographies || {};

    const districtInfo =
      geographies["119th Congressional Districts"]?.[0] ||
      geographies["118th Congressional Districts"]?.[0] ||
      geographies["Congressional Districts"]?.[0];

    if (districtInfo) {
     congressionalDistrict =
  districtInfo.CD119 ||
  districtInfo.CD118 ||
  districtInfo.CD116 ||
  districtInfo.CD ||
  districtInfo.BASENAME ||
  districtInfo.NAME ||
  districtInfo.GEOID ||
  null;

      stateCode =
        districtInfo.STATEFP ||
        districtInfo.STATE ||
        null;
    }
  }
const stateMap: Record<string, string> = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  "10": "DE",
  "11": "DC",
  "12": "FL",
  "13": "GA",
  "15": "HI",
  "16": "ID",
  "17": "IL",
  "18": "IN",
  "19": "IA",
  "20": "KS",
  "21": "KY",
  "22": "LA",
  "23": "ME",
  "24": "MD",
  "25": "MA",
  "26": "MI",
  "27": "MN",
  "28": "MS",
  "29": "MO",
  "30": "MT",
  "31": "NE",
  "32": "NV",
  "33": "NH",
  "34": "NJ",
  "35": "NM",
  "36": "NY",
  "37": "NC",
  "38": "ND",
  "39": "OH",
  "40": "OK",
  "41": "OR",
  "42": "PA",
  "44": "RI",
  "45": "SC",
  "46": "SD",
  "47": "TN",
  "48": "TX",
  "49": "UT",
  "50": "VT",
  "51": "VA",
  "53": "WA",
  "54": "WV",
  "55": "WI",
  "56": "WY",
};

const stateAbbr =
  stateCode ? stateMap[stateCode] : null;

let representative = null;
let senators: Awaited<ReturnType<typeof prisma.representative.findMany>> = [];

if (stateAbbr && congressionalDistrict) {
  representative = await prisma.representative.findFirst({
    where: {
      stateCode: stateAbbr,
      district: congressionalDistrict,
      chamber: "House",
    },
  });

  senators = await prisma.representative.findMany({
    where: {
      stateCode: stateAbbr,
      chamber: "Senate",
    },
  });
}
  const saved = await prisma.userAddress.create({
    data: {
      fullName: body.fullName || null,
      address1: body.address1,
      city: body.city,
      state: body.state,
      zip: body.zip,
      matchedAddress,
      congressionalDistrict,
      stateCode,
    },
  });

return NextResponse.json({
  message: "Address saved successfully.",
  saved,
  representative,
  senators,
});
}
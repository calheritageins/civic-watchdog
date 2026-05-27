import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Link from "next/link";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RepresentativePage({ params }: PageProps) {
  const { id } = await params;

  const representative = await prisma.representative.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!representative) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl rounded bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">Representative not found</h1>

          <Link href="/" className="mt-4 inline-block text-blue-600">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const officialVotes = await prisma.representativeBillVote.findMany({
    where: {
      representativeId: representative.id,
    },
    include: {
      bill: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-block text-blue-600">
          ← Back to dashboard
        </Link>

        <section className="rounded bg-white p-8 shadow">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">
                {representative.chamber}
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {representative.fullName}
              </h1>

              <p className="mt-2 text-lg text-gray-700">
                {representative.party || "Party unknown"} •{" "}
                {representative.stateCode}
                {representative.chamber === "House"
                  ? `-${representative.district}`
                  : ""}
              </p>

              <div className="mt-4 inline-block rounded bg-gray-200 px-3 py-1 text-sm font-semibold">
                Unclaimed Profile
              </div>
            </div>

            <div className="rounded border p-4">
              <p className="font-bold">Contact</p>

              <p className="mt-2">
                <strong>Phone:</strong>{" "}
                {representative.phone || "N/A"}
              </p>

              {representative.website && (
                <a
                  href={representative.website}
                  target="_blank"
                  className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Official Website
                </a>
              )}

              {representative.phone && (
                <a
                  href={`tel:${representative.phone}`}
                  className="mt-3 block rounded bg-green-600 px-4 py-2 text-center text-white"
                >
                  Call Office
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Official Votes Tracked</p>
            <p className="mt-2 text-4xl font-bold">
              {officialVotes.length}
            </p>
          </div>

          <div className="rounded bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Claim Status</p>
            <p className="mt-2 text-2xl font-bold">Unclaimed</p>
          </div>

          <div className="rounded bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Profile Type</p>
            <p className="mt-2 text-2xl font-bold">
              Public Accountability
            </p>
          </div>
        </section>

        <section className="mt-6 rounded bg-white p-6 shadow">
          <h2 className="text-2xl font-bold">About This Representative</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <p>
              <strong>Full Name:</strong> {representative.fullName}
            </p>

            <p>
              <strong>Chamber:</strong> {representative.chamber}
            </p>

            <p>
              <strong>State:</strong> {representative.stateCode}
            </p>

            <p>
              <strong>District:</strong> {representative.district}
            </p>

            <p>
              <strong>Party:</strong> {representative.party || "N/A"}
            </p>

            <p>
              <strong>Bioguide ID:</strong>{" "}
              {representative.bioguideId || "N/A"}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded bg-white p-6 shadow">
          <h2 className="text-2xl font-bold">Tracked Voting Record</h2>

          {officialVotes.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No official votes have been imported for this representative yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {officialVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="rounded border p-4"
                >
                  <p className="text-sm text-gray-500">
                    {vote.bill.billType} {vote.bill.billNumber}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {vote.bill.title}
                  </h3>

                  <p className="mt-2">
                    <strong>Official Position:</strong>{" "}
                    {vote.position}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
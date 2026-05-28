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

export default async function BillDetailPage({ params }: PageProps) {
  const { id } = await params;

  const bill = await prisma.bill.findUnique({
  where: {
    id: Number(id),
  },
});

if (!bill) {
  return (
    <main className="min-h-screen bg-[#06111f] p-8 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#071827] p-8">
        <h1 className="text-4xl font-black">Bill not found</h1>

        <Link
          href="/bills"
          className="mt-6 inline-block rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black"
        >
          Back to Bills
        </Link>
      </div>
    </main>
  );
}

const officialVotes = await prisma.representativeBillVote.findMany({
  where: {
    billId: bill.id,
  },
  include: {
    representative: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});

  if (!bill) {
    return (
      <main className="min-h-screen bg-[#06111f] p-8 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#071827] p-8">
          <h1 className="text-4xl font-black">Bill not found</h1>

          <Link
            href="/bills"
            className="mt-6 inline-block rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black"
          >
            Back to Bills
          </Link>
        </div>
      </main>
    );
  }

  const supportVotes = officialVotes.filter(
    (vote) => vote.position === "Yea" || vote.position === "Support"
  );

  const opposeVotes = officialVotes.filter(
    (vote) => vote.position === "Nay" || vote.position === "Oppose"
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06111f] p-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.06),transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl">
        <Link
          href="/bills"
          className="mb-6 inline-block text-yellow-300 hover:text-yellow-200"
        >
          ← Back to Bills
        </Link>

        <section className="rounded-3xl border border-white/10 bg-[#071827]/90 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">
            Bill Intelligence Profile
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            {bill.billType} {bill.billNumber}
          </h1>

          <h2 className="mt-5 max-w-5xl text-2xl font-bold text-white/90">
            {bill.title}
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/70">
              Congress {bill.congress}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/70">
              {bill.status || "Status unknown"}
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 font-semibold text-yellow-300">
              Public Bill Profile
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <p className="text-sm text-white/50">Tracked Official Positions</p>
            <p className="mt-3 text-5xl font-black text-yellow-300">
              {officialVotes.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <p className="text-sm text-white/50">Support / Yea</p>
            <p className="mt-3 text-5xl font-black text-green-400">
              {supportVotes.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <p className="text-sm text-white/50">Oppose / Nay</p>
            <p className="mt-3 text-5xl font-black text-red-400">
              {opposeVotes.length}
            </p>
          </div>
        </section>

        {bill.aiSummary && (
          <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0b1d33] p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">
              AI-Assisted Explanation
            </p>

            <div className="mt-5 whitespace-pre-wrap text-white/80">
              {bill.aiSummary}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <h2 className="text-3xl font-black">Official Summary</h2>

          <p className="mt-4 leading-8 text-white/70">
            {bill.summary || "No official summary has been imported yet."}
          </p>

          {bill.sourceUrl && (
            <a
              href={bill.sourceUrl}
              target="_blank"
              className="mt-6 inline-block rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black"
            >
              View Official Source
            </a>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <h2 className="text-3xl font-black">Representative Positions</h2>

          {officialVotes.length === 0 ? (
            <p className="mt-4 text-white/60">
              No representative positions have been imported for this bill yet.
            </p>
          ) : (
            <div className="mt-6 grid gap-4">
              {officialVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="rounded-2xl border border-white/10 bg-[#081a2e] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Link
                        href={`/representatives/${vote.representative.id}`}
                        className="text-xl font-bold text-yellow-300 hover:text-yellow-200"
                      >
                        {vote.representative.fullName}
                      </Link>

                      <p className="mt-1 text-white/50">
                        {vote.representative.chamber} •{" "}
                        {vote.representative.party || "Unknown"} •{" "}
                        {vote.representative.stateCode}
                        {vote.representative.chamber === "House"
                          ? `-${vote.representative.district}`
                          : ""}
                      </p>
                    </div>

                    <div
                      className={
                        vote.position === "Yea" || vote.position === "Support"
                          ? "rounded-2xl bg-green-500/10 px-4 py-2 font-bold text-green-400"
                          : vote.position === "Nay" || vote.position === "Oppose"
                            ? "rounded-2xl bg-red-500/10 px-4 py-2 font-bold text-red-400"
                            : "rounded-2xl bg-white/10 px-4 py-2 font-bold text-white/60"
                      }
                    >
                      {vote.position}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bill = {
  id: number;
  congress: number;
  billType: string;
  billNumber: string;
  title: string;
  summary: string | null;
  aiSummary: string | null;
  status: string | null;
  userVote: string | null;
};

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [billType, setBillType] = useState("");
  const [unvotedOnly, setUnvotedOnly] = useState(true);

  async function loadBills() {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (billType) params.set("billType", billType);
    params.set("unvotedOnly", String(unvotedOnly));

    const response = await fetch(`/api/bills/search?${params.toString()}`);
    const data = await response.json();

    setBills(data.bills || []);
  }

  useEffect(() => {
    loadBills();
  }, []);

  return (
    <main className="min-h-screen bg-[#06111f] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-white/10 bg-[#071827]/90 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">
            Legislative Intelligence
          </p>

          <h1 className="mt-3 text-5xl font-black">Bills</h1>

          <p className="mt-4 max-w-3xl text-white/60">
            Browse active legislation, review AI summaries, and record your position.
            By default, this page shows bills you have not voted on yet.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <input
              placeholder="Search bills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#081a2e] p-4 text-white placeholder:text-white/40"
            />

            <select
              value={billType}
              onChange={(e) => setBillType(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#081a2e] p-4 text-white"
            >
              <option value="">All Bill Types</option>
              <option value="HR">House Bills</option>
              <option value="S">Senate Bills</option>
            </select>

            <button
              type="button"
              onClick={() => setUnvotedOnly(!unvotedOnly)}
              className={
                unvotedOnly
                  ? "rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black"
                  : "rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white"
              }
            >
              {unvotedOnly ? "Showing Unvoted" : "Showing All"}
            </button>

            <button
              onClick={loadBills}
              className="rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black shadow-lg shadow-yellow-400/20 transition hover:scale-[1.02]"
            >
              Search Bills
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-6">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-white/40">
                    {bill.billType} {bill.billNumber} • Congress {bill.congress}
                  </p>

                  <h2 className="mt-2 text-3xl font-black">{bill.title}</h2>

                  <p className="mt-3 text-white/70">
                    {bill.summary || "No official summary available yet."}
                  </p>

                  {bill.userVote && (
                    <p className="mt-4 inline-block rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 font-semibold text-yellow-300">
                      Your vote: {bill.userVote}
                    </p>
                  )}
                </div>

                <Link
                  href={`/bills/${bill.id}`}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 text-center font-bold text-black transition hover:scale-[1.01]"
                >
                  View Bill Details
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";

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
  const { isSignedIn } = useUser();

  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [billType, setBillType] = useState("");
  const [unvotedOnly, setUnvotedOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadBills() {
    setLoading(true);

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (billType) params.set("billType", billType);

    params.set("unvotedOnly", String(unvotedOnly));

    const response = await fetch(`/api/bills/search?${params.toString()}`);
    const data = await response.json();

    setBills(data.bills || []);
    setLoading(false);
  }

  async function submitVote(billId: number, position: string) {
    if (!isSignedIn) {
      alert("Please sign in to save your vote.");
      return;
    }

    const response = await fetch("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ billId, position }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Vote failed.");
      return;
    }

    setBills((previousBills) =>
      previousBills.map((bill) =>
        bill.id === billId ? { ...bill, userVote: position } : bill
      )
    );

    alert(`Vote recorded: ${position}`);
  }

  useEffect(() => {
    loadBills();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06111f] px-6 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.06),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        <section className="rounded-3xl border border-white/10 bg-[#071827]/90 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">
            Legislative Intelligence
          </p>

          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black">Bills</h1>

              <p className="mt-4 max-w-3xl text-white/60">
                Discover legislation, review plain-English summaries, and record
                your position. By default, this page shows bills you have not
                voted on yet.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <input
              placeholder="Search bills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#081a2e] p-4 text-white placeholder:text-white/40 focus:border-yellow-400/40 focus:outline-none"
            />

            <div className="rounded-2xl border border-white/10 bg-[#081a2e] p-4">
              <p className="mb-3 text-sm font-semibold text-white/60">
                Bill Type
              </p>

              <div className="flex gap-2">
                {["HR", "S"].map((type) => {
                  const selected = billType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBillType(selected ? "" : type)}
                      className={
                        selected
                          ? "rounded-xl bg-yellow-400 px-4 py-2 font-bold text-black"
                          : "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70"
                      }
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
  type="button"
  onClick={() => setUnvotedOnly(!unvotedOnly)}
  className={
    unvotedOnly
      ? "rounded-2xl border border-yellow-400/30 bg-yellow-400 px-5 py-3 font-bold text-black shadow-lg shadow-yellow-400/20"
      : "rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
  }
>
  {unvotedOnly ? "Show All Bills" : "Show Only Unvoted"}
</button>

            <button
              onClick={loadBills}
              className="rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black shadow-lg shadow-yellow-400/20 transition hover:scale-[1.02]"
            >
              {loading ? "Loading..." : "Search Bills"}
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-6">
          {bills.map((bill) => (
            <article
              key={bill.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#081a2e] p-8 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30"
            >
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-yellow-400/5 blur-3xl transition group-hover:bg-yellow-400/10" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/40">
                    {bill.billType} {bill.billNumber} • Congress {bill.congress}
                  </p>

                  <h2 className="mt-3 text-3xl font-black leading-tight">
                    {bill.title}
                  </h2>

                  <p className="mt-4 leading-7 text-white/70">
                    {bill.summary || "No official summary available yet."}
                  </p>

                  {bill.aiSummary && (
                    <div className="mt-5 rounded-2xl border border-blue-400/20 bg-[#0b1d33] p-5">
                      <p className="text-sm font-bold text-blue-300">
                        AI Summary
                      </p>

                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-white/80">
                        {bill.aiSummary}
                      </p>
                    </div>
                  )}

                  <p className="mt-5 text-sm text-white/50">
                    <strong>Status:</strong> {bill.status || "Unknown"}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  {bill.userVote ? (
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-white/40">
                        Your Vote
                      </p>

                      <p className="mt-3 text-3xl font-black text-yellow-300">
                        {bill.userVote}
                      </p>

                      <div className="mt-5 grid gap-3">
                        <button
                          onClick={() => submitVote(bill.id, "Support")}
                          className="rounded-2xl bg-green-600 px-4 py-3 font-bold text-white transition hover:scale-[1.02]"
                        >
                          Change to Support
                        </button>

                        <button
                          onClick={() => submitVote(bill.id, "Oppose")}
                          className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:scale-[1.02]"
                        >
                          Change to Oppose
                        </button>

                        <button
                          onClick={() => submitVote(bill.id, "Unsure")}
                          className="rounded-2xl bg-gray-700 px-4 py-3 font-bold text-white transition hover:scale-[1.02]"
                        >
                          Change to Unsure
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-white/40">
                        Record Position
                      </p>

                      {isSignedIn ? (
                        <div className="mt-5 grid gap-3">
                          <button
                            onClick={() => submitVote(bill.id, "Support")}
                            className="rounded-2xl bg-green-600 px-4 py-3 font-bold text-white transition hover:scale-[1.02]"
                          >
                            Support
                          </button>

                          <button
                            onClick={() => submitVote(bill.id, "Oppose")}
                            className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:scale-[1.02]"
                          >
                            Oppose
                          </button>

                          <button
                            onClick={() => submitVote(bill.id, "Unsure")}
                            className="rounded-2xl bg-gray-700 px-4 py-3 font-bold text-white transition hover:scale-[1.02]"
                          >
                            Unsure
                          </button>
                        </div>
                      ) : (
                        <SignInButton mode="modal">
                          <button className="mt-5 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black">
                            Sign In to Vote
                          </button>
                        </SignInButton>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/bills/${bill.id}`}
                    className="mt-5 block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-bold text-white transition hover:bg-white/10"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {!loading && bills.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-[#081a2e] p-8 text-center shadow-xl">
              <p className="text-2xl font-black">No bills found.</p>
              <p className="mt-3 text-white/60">
                Try changing your filters or showing all bills.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
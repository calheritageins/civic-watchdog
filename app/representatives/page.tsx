"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Representative = {
  bioguideId: string | null;
  id: number;
  fullName: string;
  party: string | null;
  stateCode: string | null;
  chamber: string;
  district: string | null;
};

export default function RepresentativesPage() {
  const [representatives, setRepresentatives] = useState<
    Representative[]
  >([]);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string[]>([]);
const [partyFilter, setPartyFilter] = useState<string[]>([]);
const [chamberFilter, setChamberFilter] = useState<string[]>([]);

  async function loadRepresentatives() {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (stateFilter.length)
  params.set("state", stateFilter.join(","));

if (partyFilter.length)
  params.set("party", partyFilter.join(","));

if (chamberFilter.length)
  params.set("chamber", chamberFilter.join(","));

    const response = await fetch(
      `/api/representatives?${params.toString()}`
    );

    const data = await response.json();

    setRepresentatives(data.representatives || []);
  }

  useEffect(() => {
    loadRepresentatives();
  }, []);

  return (
    <main className="min-h-screen bg-[#06111f] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-[#071827]/90 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">
                Public Accountability Profiles
              </p>

              <h1 className="mt-3 text-5xl font-black">
                Representatives
              </h1>
            </div>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <input
              placeholder="Search name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#081a2e] p-4 text-white placeholder:text-white/40"
            />

            
            <div className="rounded-2xl border border-white/10 bg-[#081a2e] p-4 md:col-span-4">
  <p className="mb-3 text-sm font-semibold text-white/60">
    States
  </p>

  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-2">
    {[
      "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
      "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
      "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
      "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
      "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
    ].map((state) => {
      const selected = stateFilter.includes(state);

      return (
        <button
          key={state}
          type="button"
          onClick={() => {
            if (selected) {
              setStateFilter(stateFilter.filter((s) => s !== state));
            } else {
              setStateFilter([...stateFilter, state]);
            }
          }}
          className={
            selected
              ? "rounded-xl bg-yellow-400 px-3 py-2 font-bold text-black"
              : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/70"
          }
        >
          {state}
        </button>
      );
    })}
  </div>
</div>

            <div className="rounded-2xl border border-white/10 bg-[#081a2e] p-4">
  <p className="mb-3 text-sm font-semibold text-white/60">
    Party
  </p>

  <div className="flex flex-wrap gap-2">
    {[
      "Democratic",
      "Republican",
      "Independent",
    ].map((party) => {
      const selected =
        partyFilter.includes(party);

      return (
        <button
          key={party}
          type="button"
          onClick={() => {
            if (selected) {
              setPartyFilter(
                partyFilter.filter(
                  (p) => p !== party
                )
              );
            } else {
              setPartyFilter([
                ...partyFilter,
                party,
              ]);
            }
          }}
          className={
            selected
              ? "rounded-xl bg-yellow-400 px-3 py-2 font-bold text-black"
              : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/70"
          }
        >
          {party}
        </button>
      );
    })}
  </div>
</div>

            <div className="rounded-2xl border border-white/10 bg-[#081a2e] p-4">
  <p className="mb-3 text-sm font-semibold text-white/60">
    Chamber
  </p>

  <div className="flex flex-wrap gap-2">
    {["House", "Senate"].map((chamber) => {
      const selected =
        chamberFilter.includes(chamber);

      return (
        <button
          key={chamber}
          type="button"
          onClick={() => {
            if (selected) {
              setChamberFilter(
                chamberFilter.filter(
                  (c) => c !== chamber
                )
              );
            } else {
              setChamberFilter([
                ...chamberFilter,
                chamber,
              ]);
            }
          }}
          className={
            selected
              ? "rounded-xl bg-yellow-400 px-3 py-2 font-bold text-black"
              : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/70"
          }
        >
          {chamber}
        </button>
      );
    })}
  </div>
</div>
          </div>

          <button
            onClick={loadRepresentatives}
            className="mt-5 rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black shadow-lg shadow-yellow-400/20 transition hover:scale-[1.02]"
          >
            Search Representatives
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {representatives.map((rep) => (
            <div
              key={rep.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30"
            >
              <div className="flex items-start justify-between gap-4">
  <div className="flex items-start gap-4">
    {rep.bioguideId ? (
  <img
    src={`https://www.congress.gov/img/member/${rep.bioguideId.toLowerCase()}_200.jpg`}
    alt={rep.fullName}
    className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
  />
) : (
  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#0d2239] text-2xl">
    👤
  </div>
)}

    <div>
                  <h2 className="text-2xl font-black">
                    {rep.fullName}
                  </h2>

                  <p className="mt-2 text-white/60">
                    {rep.party || "Unknown"} •{" "}
                    {rep.chamber}
                  </p>

                  <p className="mt-1 text-white/40">
                    {rep.stateCode}
                    {rep.chamber === "House" &&
                    rep.district
                      ? `-${rep.district}`
                      : ""}
                  </p>
                </div>

</div>
                <div className="rounded-xl bg-yellow-400/10 px-3 py-2 text-sm font-bold text-yellow-300">
                  Public
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Link
                  href={`/representatives/${rep.id}`}
                  className="flex-1 rounded-2xl bg-yellow-400 px-5 py-3 text-center font-bold text-black transition hover:scale-[1.01]"
                >
                  View Details
                </Link>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
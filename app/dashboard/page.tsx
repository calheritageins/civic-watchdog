"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

type Representative = {
  id?: number;
  fullName: string;
  party: string | null;
  website: string | null;
  phone: string | null;
};

type Senator = Representative;

type Bill = {
  id: number;
  congress: number;
  billType: string;
  billNumber: string;
  title: string;
  summary: string | null;
  aiSummary: string | null;
  status: string | null;
};

type AlignmentItem = {
  representative: {
    fullName: string;
    chamber: string;
    party: string | null;
  };
  alignmentPercent: number;
  participationPercent: number;
  comparableVotes: number;
  matchingVotes: number;
  totalTrackedBills: number;
};

type AlignmentResponse = {
  alignments: AlignmentItem[];
};

export default function Home() {
  const { isSignedIn } = useUser();

  const [form, setForm] = useState({
    fullName: "",
    address1: "",
    city: "",
    state: "",
    zip: "",
  });

  const [savedUserId, setSavedUserId] = useState<number | null>(null);
  const [representative, setRepresentative] =
    useState<Representative | null>(null);
  const [senators, setSenators] = useState<Senator[]>([]);
  const [alignment, setAlignment] = useState<AlignmentResponse | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      if (!isSignedIn) return;

      const meResponse = await fetch("/api/me");

      if (!meResponse.ok) {
        console.log("No saved profile found.");
        return;
      }

      const meData = await meResponse.json();

      if (meData.latestAddress) {
        setForm({
          fullName: meData.latestAddress.fullName || "",
          address1: meData.latestAddress.address1 || "",
          city: meData.latestAddress.city || "",
          state: meData.latestAddress.state || "",
          zip: meData.latestAddress.zip || "",
        });

        setSavedUserId(meData.latestAddress.id);
      }

      setRepresentative(meData.representative || null);
      setSenators(meData.senators || []);

      await loadAlignment();
    }

    loadInitialData();
  }, [isSignedIn]);

  async function loadAlignment() {
    const response = await fetch("/api/alignment");

    if (!response.ok) {
      console.log("Alignment not available yet.");
      return;
    }

    const data = await response.json();
    setAlignment(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    setSavedUserId(data.saved.id);
    setRepresentative(data.representative);
    setSenators(data.senators || []);

    await loadAlignment();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06111f] px-6 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.06),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-[#071827]/90 p-6 shadow-2xl backdrop-blur">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Civic Watchdog
            </h1>
            <p className="text-sm text-white/60">
              Track your representatives, bills, votes, and alignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-2xl bg-yellow-400 px-4 py-2 font-bold text-black shadow-lg shadow-yellow-400/20 transition hover:scale-[1.02]">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}

            {isSignedIn && <UserButton />}
          </div>
        </div>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#071827] shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1575320181282-9afab399332c?q=80&w=1600&auto=format&fit=crop"
            alt="US Capitol"
            className="h-[380px] w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#06111f] via-[#06111f]/80 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-3xl p-10">
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
                Civic Intelligence Platform
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                You’re in charge of your democracy.
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-white/70">
                Track legislation. Monitor representatives. Measure alignment.
                Hold power accountable.
              </p>

              <div className="mt-8 flex gap-4">
                <Link
                  href="/representatives"
                  className="rounded-2xl bg-yellow-400 px-6 py-4 font-bold text-black"
                >
                  View Representatives
                </Link>

                <Link
                  href="/bills"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white"
                >
                  Explore Bills
                </Link>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-[#071827]/90 p-8 shadow-2xl backdrop-blur"
        >
          <div className="mb-6 flex gap-3">
            <Link
              href="/representatives"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Browse Representatives
            </Link>

            <Link
              href="/bills"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Browse Bills
            </Link>
          </div>

          <h1 className="mb-6 text-4xl font-bold">Find My Representatives</h1>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["fullName", "Full Name"],
              ["address1", "Address"],
              ["city", "City"],
              ["state", "State"],
              ["zip", "ZIP"],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                placeholder={placeholder}
                className="rounded-2xl border border-white/10 bg-[#081a2e] p-4 text-white placeholder:text-white/40 focus:border-yellow-400/40 focus:outline-none"
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
              />
            ))}

            <button
              type="submit"
              className="rounded-2xl bg-yellow-400 p-4 font-bold text-black shadow-lg shadow-yellow-400/20 transition hover:scale-[1.02]"
            >
              Lookup Representatives
            </button>
          </div>
        </form>

        {alignment?.alignments?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {alignment.alignments.map((item) => (
              <div
                key={item.representative.fullName}
                className="rounded-3xl border border-white/10 bg-[#081a2e] p-6 shadow-xl"
              >
                <h2 className="text-2xl font-black tracking-tight">
                  {item.representative.fullName}
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  {item.representative.chamber} •{" "}
                  {item.representative.party || "N/A"}
                </p>

                <div className="mt-6 flex items-center justify-center">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-yellow-400/80 bg-yellow-400/10 shadow-[0_0_35px_rgba(250,204,21,0.25)]">
                    <span className="text-4xl font-black text-yellow-300">
                      {item.alignmentPercent}%
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-sm text-white/70">
                  Alignment on {item.matchingVotes} out of{" "}
                  {item.comparableVotes} comparable votes.
                </p>

                <p className="mt-2 text-sm text-white/70">
                  Participation: {item.participationPercent}% (
                  {item.comparableVotes} of {item.totalTrackedBills} tracked
                  votes)
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {representative && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#081a2e] p-6 shadow-xl">
            <h2 className="text-3xl font-black tracking-tight">
              Your House Representative
            </h2>

            <p className="mt-4 text-xl font-semibold">
              {representative.fullName}
            </p>

            <p className="mt-2 text-white/70">
              <strong>Party:</strong> {representative.party || "N/A"}
            </p>

            <p className="text-white/70">
              <strong>Phone:</strong> {representative.phone || "N/A"}
            </p>

            <div className="mt-4 flex gap-3">
              {representative.phone && (
                <a
                  href={`tel:${representative.phone}`}
                  className="rounded-2xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:scale-[1.02]"
                >
                  Call Office
                </a>
              )}

              {representative.website && (
                <a
                  href={representative.website}
                  target="_blank"
                  className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Official Website
                </a>
              )}
            </div>
          </div>
        )}

        {senators.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#081a2e] p-6 shadow-xl">
            <h2 className="mb-4 text-3xl font-black tracking-tight">
              Your U.S. Senators
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {senators.map((senator) => (
                <div
                  key={senator.fullName}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xl font-semibold">{senator.fullName}</p>

                  <p className="mt-2 text-white/70">
                    <strong>Party:</strong> {senator.party || "N/A"}
                  </p>

                  <p className="text-white/70">
                    <strong>Phone:</strong> {senator.phone || "N/A"}
                  </p>

                  <div className="mt-4 flex gap-3">
                    {senator.phone && (
                      <a
                        href={`tel:${senator.phone}`}
                        className="rounded-2xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:scale-[1.02]"
                      >
                        Call Office
                      </a>
                    )}

                    {senator.website && (
                      <a
                        href={senator.website}
                        target="_blank"
                        className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white"
                      >
                        Official Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
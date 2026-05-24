"use client";

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

type AlignmentResponse = {
  alignmentPercent: number | null;
  comparableVotes: number;
  matchingVotes: number;
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
  const [bills, setBills] = useState<Bill[]>([]);
  const [alignment, setAlignment] =
    useState<AlignmentResponse | null>(null);

  useEffect(() => {
    async function loadBills() {
      const response = await fetch("/api/bills");
      const data = await response.json();
      setBills(data.bills || []);
    }

    loadBills();
  }, []);

  async function loadAlignment() {
    const response = await fetch("/api/alignment");

    if (!response.ok) {
      console.log("Alignment not available yet.");
      return;
    }

    const data = await response.json();
    console.log(data);
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

    console.log(data);

    setSavedUserId(data.saved.id);
    setRepresentative(data.representative);
    setSenators(data.senators || []);

    await loadAlignment();
  }

  async function submitVote(billId: number, position: string) {
    if (!isSignedIn) {
      alert("Please sign in to save your vote.");
      return;
    }

    if (!savedUserId) {
      alert("Please lookup your address first.");
      return;
    }

    const response = await fetch("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billId,
        position,
      }),
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      alert(data.error || "Vote failed.");
      return;
    }

    await loadAlignment();

    alert(`Vote recorded: ${position}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between rounded bg-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-bold">Civic Watchdog</h1>
            <p className="text-sm text-gray-600">
              Track your representatives, bills, votes, and alignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <button className="rounded bg-black px-4 py-2 text-white">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="rounded border px-4 py-2">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}

            {isSignedIn && <UserButton />}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded bg-white p-6 shadow"
        >
          <h1 className="mb-6 text-4xl font-bold">Find My Representatives</h1>

          <div className="flex flex-col gap-4">
            <input
              placeholder="Full Name"
              className="border p-3"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />

            <input
              placeholder="Address"
              className="border p-3"
              value={form.address1}
              onChange={(e) =>
                setForm({ ...form, address1: e.target.value })
              }
            />

            <input
              placeholder="City"
              className="border p-3"
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />

            <input
              placeholder="State"
              className="border p-3"
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
            />

            <input
              placeholder="ZIP"
              className="border p-3"
              value={form.zip}
              onChange={(e) =>
                setForm({ ...form, zip: e.target.value })
              }
            />

            <button
              type="submit"
              className="rounded bg-black p-3 text-white"
            >
              Lookup Representatives
            </button>
          </div>
        </form>

        {alignment && (
          <div className="mt-6 rounded border border-yellow-300 bg-yellow-100 p-6 shadow">
            <h2 className="text-3xl font-bold">Alignment Score</h2>

            <p className="mt-4 text-5xl font-bold">
              {alignment.alignmentPercent ?? 0}%
            </p>

            <p className="mt-3 text-lg">
              Your representative has aligned with you{" "}
              {alignment.matchingVotes} out of{" "}
              {alignment.comparableVotes} comparable votes.
            </p>
          </div>
        )}

        {representative && (
          <div className="mt-6 rounded bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              Your House Representative
            </h2>

            <p className="text-xl font-semibold">
              {representative.fullName}
            </p>

            <p>
              <strong>Party:</strong> {representative.party || "N/A"}
            </p>

            <p>
              <strong>Phone:</strong> {representative.phone || "N/A"}
            </p>

            {representative.website && (
              <a
                href={representative.website}
                target="_blank"
                className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
              >
                Visit Official Website
              </a>
            )}
          </div>
        )}

        {senators.length > 0 && (
          <div className="mt-6 rounded bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">Your U.S. Senators</h2>

            <div className="grid gap-4">
              {senators.map((senator) => (
                <div key={senator.fullName} className="rounded border p-4">
                  <p className="text-xl font-semibold">
                    {senator.fullName}
                  </p>

                  <p>
                    <strong>Party:</strong> {senator.party || "N/A"}
                  </p>

                  <p>
                    <strong>Phone:</strong> {senator.phone || "N/A"}
                  </p>

                  {senator.website && (
                    <a
                      href={senator.website}
                      target="_blank"
                      className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white"
                    >
                      Visit Official Website
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {bills.length > 0 && (
          <div className="mt-6 rounded bg-white p-6 shadow">
            <h2 className="mb-6 text-2xl font-bold">Active Bills</h2>

            <div className="grid gap-6">
              {bills.map((bill) => (
                <div key={bill.id} className="rounded border p-5">
                  <p className="text-sm text-gray-500">
                    {bill.billType} {bill.billNumber}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold">{bill.title}</h3>

                  <p className="mt-3 text-gray-700">
                    {bill.summary || "No summary available yet."}
                  </p>
                  {bill.aiSummary && (
  <div className="mt-4 rounded bg-blue-50 p-4 border border-blue-200">
    <p className="text-sm font-bold text-blue-900">
      AI Summary
    </p>

    <p className="mt-2 whitespace-pre-wrap text-gray-800">
      {bill.aiSummary}
    </p>
  </div>
)}

                  <p className="mt-3">
                    <strong>Status:</strong> {bill.status}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => submitVote(bill.id, "Support")}
                      className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                      Support
                    </button>

                    <button
                      onClick={() => submitVote(bill.id, "Oppose")}
                      className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                      Oppose
                    </button>

                    <button
                      onClick={() => submitVote(bill.id, "Unsure")}
                      className="rounded bg-gray-600 px-4 py-2 text-white"
                    >
                      Unsure
                    </button>
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
import Link from "next/link";
import {
  FileText,
  Users,
  Crosshair,
  ShieldCheck,
  MapPin,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#06111f] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1575320181282-9afab399332c?q=80&w=1800&auto=format&fit=crop"
            alt="United States Capitol"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06111f] via-[#06111f]/85 to-[#06111f]/50" />
        </div>

        <header className="relative z-10 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-2xl font-black tracking-wide">
                CIVIC WATCHDOG
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300">
                Citizen Intelligence Network
              </p>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
              <a href="#how" className="text-white/80 hover:text-white">
                How It Works
              </a>
              <Link href="/bills" className="text-white/80 hover:text-white">
                Bills
              </Link>
              <Link
                href="/representatives"
                className="text-white/80 hover:text-white"
              >
                Representatives
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/20 px-4 py-2 text-white"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl bg-yellow-400 px-4 py-2 font-black text-black"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-5xl font-black uppercase leading-tight md:text-7xl">
                Government Works For You.
                <span className="block text-yellow-300">So Watch It.</span>
              </h2>

              <p className="mt-8 max-w-2xl text-xl leading-9 text-white/75">
                Understand bills. Track votes. See how closely your
                representatives align with you.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-yellow-400 px-7 py-4 font-black text-black shadow-2xl shadow-yellow-400/20"
                >
                  Find My Representatives
                </Link>

                <Link
                  href="/bills"
                  className="rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white"
                >
                  Explore Congress
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-3xl border border-white/10 bg-[#081a2e]/70 p-8 shadow-2xl backdrop-blur">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

                <div className="rounded-3xl border border-white/10 bg-[#06111f]/80 p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-yellow-300">
                        Oversight Scan
                      </p>
                      <h3 className="mt-2 text-2xl font-black">
                        Capitol Intelligence
                      </h3>
                    </div>

                    <ShieldCheck className="h-9 w-9 text-yellow-300" />
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">
                          Alignment Signal
                        </span>
                        <span className="font-black text-green-400">78%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[78%] rounded-full bg-green-400" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Tracked Bills</span>
                        <span className="font-black text-yellow-300">142</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[64%] rounded-full bg-yellow-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <MapPin className="mx-auto h-6 w-6 text-yellow-300" />
                        <p className="mt-2 text-xs text-white/50">District</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <Users className="mx-auto h-6 w-6 text-yellow-300" />
                        <p className="mt-2 text-xs text-white/50">Reps</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <BarChart3 className="mx-auto h-6 w-6 text-yellow-300" />
                        <p className="mt-2 text-xs text-white/50">Votes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 rounded-3xl border border-white/10 bg-[#081a2e]/80 p-6 backdrop-blur md:grid-cols-4">
            {[
              [FileText, "Track Legislation", "Stay informed on active bills"],
              [Users, "Monitor Representatives", "View voting records"],
              [Crosshair, "Measure Alignment", "Compare votes to your views"],
              [ShieldCheck, "Hold Power Accountable", "Transparency drives action"],
            ].map(([Icon, title, text]) => (
              <div
                key={String(title)}
                className="border-white/10 p-4 md:border-r last:border-r-0"
              >
                <Icon className="h-10 w-10 text-yellow-300" />

                <h3 className="mt-4 font-black uppercase">
                  {title as string}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  {text as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-[#071827] p-8 shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-black">
              Your Government. Your Dashboard.
            </h2>
            <p className="mt-3 text-white/60">
              Real data. Clear insights. Total transparency.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#081a2e] p-6">
              <h3 className="font-black uppercase">Your Representatives</h3>
              <div className="mt-6 space-y-5">
                {[
                  "Rep. Jamie Raskin",
                  "Sen. Chris Van Hollen",
                  "Sen. Angela Alsobrooks",
                ].map((name, index) => (
                  <div key={name} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{name}</p>
                      <p className="text-sm text-white/50">
                        {index === 0
                          ? "House Representative"
                          : "United States Senate"}
                      </p>
                    </div>
                    <div className="rounded-full border-4 border-green-400 px-3 py-2 font-black text-green-400">
                      {index === 0 ? "85%" : index === 1 ? "78%" : "72%"}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/representatives"
                className="mt-6 inline-block font-bold text-yellow-300"
              >
                View all representatives →
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#081a2e] p-6 text-center">
              <h3 className="font-black uppercase">Overall Alignment</h3>
              <div className="mx-auto mt-8 flex h-56 w-56 items-center justify-center rounded-full border-[16px] border-green-400/80 bg-green-400/5">
                <div>
                  <p className="text-6xl font-black">78%</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Average Alignment
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-white/60">
                Based on comparable votes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#081a2e] p-6">
              <h3 className="font-black uppercase">Recent Bill Vote</h3>
              <p className="mt-6 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/60">
                H.R. 5376
              </p>
              <h4 className="mt-4 text-2xl font-black">
                Veterans’ Health Care Improvement Act
              </h4>
              <p className="mt-3 text-green-400">Status: Passed House</p>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between rounded-xl border border-white/10 p-4">
                  <span>Your Vote</span>
                  <span className="font-black text-green-400">Support</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/10 p-4">
                  <span>Your Rep. Vote</span>
                  <span className="font-black text-green-400">Support</span>
                </div>
              </div>
              <Link
                href="/bills"
                className="mt-6 inline-block font-bold text-yellow-300"
              >
                View all tracked bills →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-[#071827] p-8">
          <h2 className="text-center text-4xl font-black">
            How Civic Watchdog Works
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              [
                "1",
                "Tell Us Where You Live",
                "We find your official representatives.",
              ],
              [
                "2",
                "Track What Matters",
                "We monitor bills, votes, and participation.",
              ],
              [
                "3",
                "Compare & Analyze",
                "We calculate alignment and key metrics.",
              ],
              [
                "4",
                "Hold Power Accountable",
                "You stay informed and government gets better.",
              ],
            ].map(([num, title, text]) => (
              <div
                key={num}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 font-black text-black">
                  {num}
                </div>
                <h3 className="mt-5 font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 rounded-3xl border border-white/10 bg-[#071827] p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-4xl font-black">
              Democracy works best when citizens are informed.
            </h2>
            <p className="mt-4 text-2xl font-black text-yellow-300">
              Be informed. Be heard. Be the watchdog.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-3xl font-black">Get Started in Seconds</h3>
            <p className="mt-3 text-white/60">
              Join citizens using data to build a better democracy.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-2xl bg-yellow-400 px-8 py-4 font-black text-black"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black">CIVIC WATCHDOG</h2>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300">
            Citizen Intelligence Network
          </p>
        </div>

        <div className="flex gap-6 text-sm text-white/60">
          <a>About</a>
          <a>Privacy</a>
          <a>Terms</a>
          <a>Contact</a>
        </div>
      </footer>
    </main>
  );
}
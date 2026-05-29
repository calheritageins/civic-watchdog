"use client";

import { usePathname } from "next/navigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/";

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && (
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#071827]/95 p-6 lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
              Civic Watchdog
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Citizen Intelligence
            </h1>
          </div>

          <nav className="mt-10 flex flex-col gap-3">
            <a
              href="/dashboard"
              className="rounded-2xl bg-white/5 px-5 py-4 font-semibold transition hover:bg-white/10"
            >
              Dashboard
            </a>

            <a
              href="/representatives"
              className="rounded-2xl bg-white/5 px-5 py-4 font-semibold transition hover:bg-white/10"
            >
              Representatives
            </a>

            <a
              href="/bills"
              className="rounded-2xl bg-white/5 px-5 py-4 font-semibold transition hover:bg-white/10"
            >
              Bills
            </a>

            <a
              href="#"
              className="rounded-2xl bg-white/5 px-5 py-4 font-semibold text-white/40"
            >
              Saved Bills
            </a>

            <a
              href="#"
              className="rounded-2xl bg-white/5 px-5 py-4 font-semibold text-white/40"
            >
              Alerts
            </a>
          </nav>

          <div className="mt-auto rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
            <p className="text-sm font-semibold text-yellow-300">
              Civic Transparency Platform
            </p>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Public accountability infrastructure for citizens,
              representatives, journalists, and researchers.
            </p>
          </div>
        </aside>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}
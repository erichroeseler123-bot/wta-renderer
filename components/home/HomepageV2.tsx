import Link from "next/link";

const CATS = [
  {
    title: "Helicopter & Flightseeing",
    href: "/tours?operator=coastalhelicopters",
    meta: "Glaciers • Icefields • Peaks",
  },
  {
    title: "Whale Watching",
    href: "/tours",
    meta: "Juneau • Auke Bay • Icy Strait",
  },
  {
    title: "Glacier Adventures",
    href: "/tours",
    meta: "Mendenhall • Ice caves • Trekking",
  },
  {
    title: "Top Shore Excursions",
    href: "/tours",
    meta: "Best sellers • Reliable timing",
  },
];

const TRUST = [
  { k: "Cruise-window ready", v: "Pick times that fit your port hours" },
  { k: "Live availability", v: "FareHarbor inventory, not stale lists" },
  { k: "Itinerary cart", v: "Build your day first, checkout later" },
];

export default function HomepageV2() {
  return (
    <main className="min-h-[70vh] sm:min-h-[80vh] bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_20%,rgba(76,201,240,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_30%,rgba(255,255,255,0.08),transparent_55%),linear-gradient(to_bottom,rgba(0,0,0,0.65),rgba(0,0,0,0.95))]" />
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4CC9F0]" />
              Live port-ready booking intel
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-6xl leading-[1.05] leading-[1.05]">
              Welcome to Alaska Tours
            </h1>

            <p className="mt-4 text-base text-white/75 md:text-lg">
              Find tours that actually fit your cruise port window. Pick a date,
              see real departure times, save the exact slot to your itinerary —
              then checkout when you’re ready.
            </p>

            {/* SEARCH */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/60">
                    Where are you docking?
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
                    Juneau, Ketchikan, Skagway (more soon)
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/60">
                    What do you want to do?
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
                    Helicopter • Whale watching • Glacier
                  </div>
                </div>
                <div className="md:self-end">
                  <Link
                    href="/tours"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[#4CC9F0]/20 px-5 py-3 text-sm font-semibold text-white hover:bg-[#4CC9F0]/28 border border-[#4CC9F0]/25 transition"
                  >
                    Browse tours →
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {TRUST.map((t) => (
                  <div
                    key={t.k}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="text-xs text-white/60">{t.k}</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">
                      {t.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tours?operator=coastalhelicopters"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Juneau Helicopters →
              </Link>
              <Link
                href="/tours"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                All tours →
              </Link>
              <Link
                href="/guides"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Port guides →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Start with a category
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Fast paths to the stuff people actually book.
            </p>
          </div>
          <Link
            href="/tours"
            className="text-sm text-white/75 hover:text-white transition"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CATS.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-white/90">
                  {c.title}
                </div>
                <div className="text-white/50 group-hover:text-white/80 transition">
                  →
                </div>
              </div>
              <div className="mt-2 text-sm text-white/60">{c.meta}</div>
              <div className="mt-5 h-px w-full bg-white/10" />
              <div className="mt-4 text-xs text-white/55">
                Built for cruise timing: choose a date → see times → save slot.
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Pick your date",
                d: "We pull real inventory for that day.",
              },
              {
                n: "2",
                t: "Choose a departure",
                d: "Save the exact FareHarbor availability slot.",
              },
              {
                n: "3",
                t: "Build your itinerary",
                d: "Add tours, then checkout when you’re ready.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-3xl border border-white/10 bg-black/30 p-6"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#4CC9F0]/20 border border-[#4CC9F0]/25 font-bold">
                  {s.n}
                </div>
                <div className="mt-4 text-lg font-semibold text-white/90">
                  {s.t}
                </div>
                <div className="mt-2 text-sm text-white/65">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOT CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-bold tracking-tight">
                Ready to pick a tour time?
              </div>
              <div className="mt-2 text-sm text-white/65">
                Start with Juneau — we’ll expand ports and categories next.
              </div>
            </div>
            <Link
              href="/tours?operator=coastalhelicopters"
              className="inline-flex items-center justify-center rounded-2xl bg-[#4CC9F0]/20 px-6 py-3 text-sm font-semibold text-white hover:bg-[#4CC9F0]/28 border border-[#4CC9F0]/25 transition"
            >
              Browse Juneau tours →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Choose Your Alaska Port | Welcome To Alaska Tours",
  description:
    "Explore our directory of Juneau, Skagway, and Ketchikan cruise ports. Review port-specific timing challenges, return buffer guidelines, and verify excursion compatibility.",
  alternates: { canonical: "https://www.welcometoalaskatours.com/ports" },
};

const PORTS = [
  {
    slug: "juneau",
    title: "Juneau",
    image: "/hero/juneau.jpg",
    copy: "Live helicopter capacity, glacier walks, and mushing camps. Direct FareHarbor API schedule sync.",
  },
  {
    slug: "skagway",
    title: "Skagway",
    image: "/hero/skagway.jpg",
    copy: "Railway transit timetables and helicopter routes. Scored against Skagway berthing windows.",
  },
  {
    slug: "ketchikan",
    title: "Ketchikan",
    image: "/hero/ketchikan.png",
    copy: "Rainforest and fjord transits. Ward Cove shuttle queues and downtown dock slots mapped.",
  },
] as const;

export default function PortsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 pb-20 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2.5rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Port Directory
            </div>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl">
              Alaska Cruise Port Excursion Planners
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/80">
              Check disembarkation margins and view compatible excursions tailored to your port window for Juneau, Skagway, and Ketchikan.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={port.image}
                  alt={port.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-xl bg-slate-950/70 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-sm">
                  {port.title}
                </span>
              </div>

              <div className="flex flex-grow flex-col justify-between space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Port Guide
                    </span>
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[9px] font-bold uppercase text-sky-900">
                      {port.slug === "juneau" ? "Live Catalog" : "Planning Guide"}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-950">{port.title}</h2>
                  <p className="text-xs leading-relaxed text-slate-600">{port.copy}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black uppercase text-sky-800 hover:text-sky-950">
                  <span>Explore Port</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section
          id="port-decision-comparison"
          aria-labelledby="port-decision-comparison-heading"
          className="mt-10 rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-900">
              Port Guides &amp; Planner Shortlists
            </div>
            <h2
              id="port-decision-comparison-heading"
              className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl"
            >
              Browse by Port Guide or 4-Tour Planner Shortlist
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Open a port guide to browse connected excursions by category, read port planning guides, or go directly to a four-tour planner shortlist for Juneau, Skagway, or Ketchikan.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                    Juneau
                  </span>
                  <Link
                    href="/ports/juneau"
                    className="text-xs font-black text-sky-800 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-950"
                  >
                    Juneau port guide →
                  </Link>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Juneau
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                  Whales, Mendenhall, glacier flights, dog sledding, fishing and adventure.
                </p>
                <div className="mt-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Juneau Planning Guides
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 sm:text-sm">
                    <li>
                      <Link href="/guides/best-shore-excursions-in-juneau" className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-900">
                        Best Shore Excursions in Juneau
                      </Link>
                    </li>
                    <li>
                      <Link href="/guides/how-to-get-to-mendenhall-glacier-from-cruise-port" className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-900">
                        How to Get to Mendenhall Glacier from Cruise Port
                      </Link>
                    </li>
                    <li>
                      <Link href="/guides/juneau-whale-watching-vs-mendenhall" className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-900">
                        Juneau Whale Watching vs Mendenhall Glacier
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Planner Shortlists &amp; Port Page
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/plan?port=juneau&topic=best-overall&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl bg-sky-800 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-900"
                  >
                    Juneau best overall shortlist →
                  </Link>
                  <Link
                    href="/plan?port=juneau&topic=wildlife-whales&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Wildlife &amp; whales shortlist →
                  </Link>
                  <Link
                    href="/plan?port=juneau&topic=glaciers&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Glaciers shortlist →
                  </Link>
                  <Link
                    href="/ports/juneau"
                    className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-950 transition hover:bg-sky-100"
                  >
                    Explore Juneau →
                  </Link>
                </div>
              </div>
            </article>

            <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                    Skagway
                  </span>
                  <Link
                    href="/ports/skagway"
                    className="text-xs font-black text-sky-800 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-950"
                  >
                    Skagway port guide →
                  </Link>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Skagway
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                  Glacier flights, Gold Rush experiences, scooters and cruise-day adventures.
                </p>
                <div className="mt-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Skagway Planning Guides
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 sm:text-sm">
                    <li>
                      <Link href="/guides/best-things-to-do-in-skagway-4-6-hours" className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-900">
                        Best Things to Do in Skagway in 4 to 6 Hours
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Planner Shortlists &amp; Port Page
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/plan?port=skagway&topic=best-overall&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl bg-sky-800 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-900"
                  >
                    Skagway best overall shortlist →
                  </Link>
                  <Link
                    href="/plan?port=skagway&topic=dog-sledding&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Dog sledding shortlist →
                  </Link>
                  <Link
                    href="/plan?port=skagway&topic=flightseeing&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Flightseeing shortlist →
                  </Link>
                  <Link
                    href="/ports/skagway"
                    className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-950 transition hover:bg-sky-100"
                  >
                    Explore Skagway →
                  </Link>
                </div>
              </div>
            </article>

            <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                    Ketchikan
                  </span>
                  <Link
                    href="/ports/ketchikan"
                    className="text-xs font-black text-sky-800 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-950"
                  >
                    Ketchikan port guide →
                  </Link>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Ketchikan
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                  Misty Fjords, bears, rainforest, kayaking, UTVs, snorkeling and more.
                </p>
                <div className="mt-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Ketchikan Planning Guides
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 sm:text-sm">
                    <li>
                      <Link href="/guides/first-time-in-ketchikan-shore-excursions" className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-900">
                        First Time in Ketchikan Shore Excursions
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Planner Shortlists &amp; Port Page
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/plan?port=ketchikan&topic=best-overall&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl bg-sky-800 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-900"
                  >
                    Ketchikan best overall shortlist →
                  </Link>
                  <Link
                    href="/plan?port=ketchikan&topic=flightseeing&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Flightseeing shortlist →
                  </Link>
                  <Link
                    href="/plan?port=ketchikan&topic=wildlife-whales&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Wildlife &amp; whales shortlist →
                  </Link>
                  <Link
                    href="/ports/ketchikan"
                    className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-950 transition hover:bg-sky-100"
                  >
                    Explore Ketchikan →
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

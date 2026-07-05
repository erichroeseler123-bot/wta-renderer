import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Choose Your Alaska Port | Welcome To Alaska Tours",
  description:
    "Explore our directory of Juneau, Skagway, and Ketchikan cruise ports. Review port-specific timing challenges, return buffer guidelines, and verify excursion compatibility.",
  alternates: { canonical: "https://welcometoalaskatours.com/ports" },
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
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2.5rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Port Directory
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl leading-none">
              Alaska Cruise Port Excursion Planners
            </h1>
            <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
              Check disembarkation margins and view compatible excursions tailored to your port window for Juneau, Skagway, and Ketchikan.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="group rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition hover:-translate-y-1 flex flex-col justify-between block"
            >
              <div className="aspect-[16/10] w-full overflow-hidden relative">
                <img
                  src={port.image}
                  alt={port.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-xl bg-slate-950/70 px-3 py-1.5 text-xs font-black uppercase text-white tracking-widest backdrop-blur-sm">
                  {port.title}
                </span>
              </div>
              
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Port Guide
                    </span>
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[9px] font-bold uppercase text-sky-850">
                      {port.slug === 'juneau' ? 'Live Catalog' : 'Planning Guide'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-955">{port.title}</h2>
                  <p className="text-xs leading-relaxed text-slate-600">{port.copy}</p>
                </div>
                <div className="text-xs font-black uppercase text-sky-850 hover:text-sky-900 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span>Explore Port</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

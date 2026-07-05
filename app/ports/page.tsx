import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Choose Your Alaska Port | Welcome To Alaska Tours",
  description:
    "Explore our directory of 8 key Alaska cruise ports. Review port-specific timing challenges, return buffer guidelines, and verify excursion compatibility.",
  alternates: { canonical: "https://welcometoalaskatours.com/ports" },
};

const PORTS = [
  {
    slug: "juneau",
    title: "Juneau",
    copy: "Live helicopter capacity, glacier walks, and mushing camps. Direct FareHarbor API schedule sync.",
  },
  {
    slug: "skagway",
    title: "Skagway",
    copy: "Railway transit timetables and helicopter routes. Scored against Skagway berthing windows.",
  },
  {
    slug: "ketchikan",
    title: "Ketchikan",
    copy: "Rainforest and fjord transits. Ward Cove shuttle queues and downtown dock slots mapped.",
  },
  {
    slug: "sitka",
    title: "Sitka",
    copy: "Halibut Point shuttle transits and ocean tender margins. Timing return buffers enforced.",
  },
  {
    slug: "icy-strait-point",
    title: "Icy Strait Point",
    copy: "Adventure and Wilderness Landing gondola transit offsets. Ziprider timing limits mapped.",
  },
  {
    slug: "haines",
    title: "Haines",
    copy: "Chilkat Preserve rafting and Skagway ferry transits. Multi-vessel schedule check.",
  },
  {
    slug: "seward",
    title: "Seward",
    copy: "Turnaround terminal connection timelines. Train and shuttle departure sync.",
  },
  {
    slug: "whittier",
    title: "Whittier",
    copy: "Resurrection Bay catamarans. Checked against hourly single-lane tunnel gates.",
  },
] as const;

export default function PortsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-955">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Port Directory
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Alaska Cruise Port Excursion Planners
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-2xl">
              Check disembarkation margins and view compatible excursions tailored to your port window.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 flex flex-col justify-between block space-y-3"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Port Guide
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${port.slug === 'juneau' ? 'bg-emerald-50 text-emerald-850' : 'bg-sky-50 text-sky-850'}`}>
                    {port.slug === 'juneau' ? 'Live Catalog' : 'Planning Guide'}
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">{port.title}</h2>
                <p className="text-xs leading-5 text-slate-600">{port.copy}</p>
              </div>
              <div className="text-xs font-bold text-sky-850 hover:text-sky-900 pt-2 border-t border-slate-100 block">
                Explore Port →
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

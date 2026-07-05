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
    copy: "Our most complete catalog with live helicopter availability, glacier flightseeing, dog sledding, and direct booking calendars.",
  },
  {
    slug: "skagway",
    title: "Skagway",
    copy: "Review Skagway's railway timetables and helicopter operators. Dynamic timing checks help you schedule excursions safely.",
  },
  {
    slug: "ketchikan",
    title: "Ketchikan",
    copy: "Plan rainforest hikes, kayaking expeditions, and boat charters around Ketchikan's specific cruise dock transfer windows.",
  },
  {
    slug: "sitka",
    title: "Sitka",
    copy: "Coordinating marine wildlife quests or historical tours requires factoring in Sitka's outer shuttle terminal transfers.",
  },
  {
    slug: "icy-strait-point",
    title: "Icy Strait Point",
    copy: "Review Hoonah high-adventure zipriders or brown bear searches matching your ship's limited port window.",
  },
  {
    slug: "haines",
    title: "Haines",
    copy: "Explore Bald Eagle Preserve rafting or fjord hiking. Timing rules factor in ferry schedules if docked in Skagway.",
  },
  {
    slug: "seward",
    title: "Seward",
    copy: "A turnaround hub for Kenai Fjords cruises. Verify train and shuttle connection timings for a stress-free turnaround.",
  },
  {
    slug: "whittier",
    title: "Whittier",
    copy: "Calculate Prince William Sound catamarans around Whittier's strict hourly, single-lane access tunnel schedule.",
  },
] as const;

export default function PortsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Port Directory
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Alaska Cruise Port Excursion Routing
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/82 sm:text-[15px]">
              Don't guess on timing. Select your cruise port to check decision challenges, calculate return buffers, and review available live excursions.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 block space-y-3"
            >
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Port Guide</div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">{port.title}</h2>
              <p className="text-sm leading-6 text-slate-600">{port.copy}</p>
              <div className="text-sm font-black uppercase tracking-[0.12em] text-cyan-700 pt-2">Explore port →</div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Choose Your Alaska Port | Welcome To Alaska Tours",
  description:
    "Start with the right Alaska port, then move into the matching decision lane instead of a generic catalog.",
  alternates: { canonical: "https://welcometoalaskatours.com/ports" },
};

const PORTS = [
  {
    slug: "juneau",
    title: "Juneau",
    copy: "The strongest live lane on the site right now, with helicopter inventory and direct booking calendars.",
  },
  {
    slug: "ketchikan",
    title: "Ketchikan",
    copy: "Routing is being staged. Use this lane to keep port context instead of dropping into a generic homepage.",
  },
  {
    slug: "skagway",
    title: "Skagway",
    copy: "Routing is being staged. Use this lane to keep decision context while the broader operator surface catches up.",
  },
] as const;

export default function PortsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">Port Router</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Choose the port first. Then open the right Alaska shortlist.</h1>
            <p className="mt-4 text-sm leading-7 text-white/82 sm:text-[15px]">This page preserves context instead of throwing cruise travelers into a generic catalog. Pick the port, then move straight into the chooser.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          {PORTS.map((port) => (
            <Link
              key={port.slug}
              href={"/plan?port=" + port.slug + "&intent=best-for&topic=shore-excursions"}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
            >
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Port Lane</div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{port.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{port.copy}</p>
              <div className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-700">Open shortlist</div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";

type PortCard = {
  slug: "juneau" | "skagway" | "ketchikan";
  title: string;
  summary: string;
};

const ports: PortCard[] = [
  {
    slug: "juneau",
    title: "Juneau",
    summary: "Whale watching, glacier views, and cruise-day departures with practical timing windows.",
  },
  {
    slug: "skagway",
    title: "Skagway",
    summary: "Scenic rail and adventure options for short-to-medium port calls.",
  },
  {
    slug: "ketchikan",
    title: "Ketchikan",
    summary: "Wildlife and family-friendly excursions with straightforward port logistics.",
  },
];

export default function PortsIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 text-slate-900">
      <h1 className="text-4xl font-black tracking-tight">Alaska Cruise Ports</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Pick your port to explore cruise-day excursion options and routes that connect directly into booking.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {ports.map((port) => (
          <article key={port.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">{port.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{port.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/ports/${port.slug}`}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700"
              >
                View Port Page
              </Link>
              <Link
                href={`/tours?port=${port.slug}`}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Browse Tours
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

import Link from "next/link";

const TOUR_TYPES = [
  {
    name: "Whale watching",
    copy: "Humpbacks, orcas, and marine wildlife on the water.",
    href: "/plan?intent=best-for&topic=whale-watching&subtype=whale",
  },
  {
    name: "Glacier tours",
    copy: "Walk, cruise, or fly to Alaska's ice up close.",
    href: "/plan?intent=best-for&topic=glacier-tours&subtype=glacier",
  },
  {
    name: "Helicopter tours",
    copy: "Flightseeing and glacier landings with the biggest views.",
    href: "/plan?intent=best-for&topic=helicopter-tours&subtype=helicopter",
  },
  {
    name: "Wildlife tours",
    copy: "Bears, eagles, sea otters, and rainforest wildlife.",
    href: "/plan?intent=best-for&topic=wildlife-tours&subtype=wildlife",
  },
  {
    name: "Train rides",
    copy: "Scenic rail like White Pass and the Alaska Railroad.",
    href: "/plan?intent=best-for&topic=train-tours&subtype=train",
  },
  {
    name: "Port-friendly excursions",
    copy: "Shorter, lower-risk options that protect your return time.",
    href: "/plan?intent=best-for&topic=port-friendly&window=short-window",
  },
] as const;

export default function TourTypeGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
            Compare tour types
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl text-balance">
            Not sure what kind of tour fits?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Compare the main ways to experience Alaska, then narrow to the options that fit your
            schedule and group.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOUR_TYPES.map((type) => (
            <Link
              key={type.name}
              href={type.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-stone-50 p-6 transition hover:-translate-y-1 hover:border-sky-300 hover:bg-white"
            >
              <h3 className="text-lg font-black tracking-tight text-slate-950">{type.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{type.copy}</p>
              <div className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-700 group-hover:text-cyan-600">
                Compare options
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

const TOUR_TYPES = [
  {
    name: "Whale watching",
    copy: "Humpbacks, orcas, and marine wildlife on the water.",
    href: "/plan?intent=best-for&topic=whale-watching&subtype=whale",
    img: "/tours/whale.png",
  },
  {
    name: "Glacier tours",
    copy: "Walk, cruise, or fly to Alaska's ice up close.",
    href: "/plan?intent=best-for&topic=glacier-tours&subtype=glacier",
    img: "/tours/glacier.png",
  },
  {
    name: "Helicopter tours",
    copy: "Flightseeing and glacier landings with the biggest views.",
    href: "/plan?intent=best-for&topic=helicopter-tours&subtype=helicopter",
    img: "/tours/helicopter.png",
  },
  {
    name: "Wildlife tours",
    copy: "Bears, eagles, sea otters, and rainforest wildlife.",
    href: "/plan?intent=best-for&topic=wildlife-tours&subtype=wildlife",
    img: "/tours/wildlife.png",
  },
  {
    name: "Train rides",
    copy: "Scenic rail like White Pass and the Alaska Railroad.",
    href: "/plan?intent=best-for&topic=train-tours&subtype=train",
    img: "/tours/train.png",
  },
  {
    name: "Port-friendly excursions",
    copy: "Shorter, lower-risk options that protect your return time.",
    href: "/plan?intent=best-for&topic=port-friendly&window=short-window",
    img: "/tours/port-friendly.png",
  },
] as const;

export default function TourTypeGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
            Compare tour types
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl text-balance">
            Not sure what kind of tour fits?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base text-pretty">
            Compare the main ways to experience Alaska, then narrow to the options that fit your
            schedule and group.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOUR_TYPES.map((type) => (
            <Link
              key={type.name}
              href={type.href}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_44px_rgba(15,23,42,0.08)] transition hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-[0_24px_64px_rgba(15,23,42,0.16)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={type.img || "/placeholder.svg"}
                  alt={`${type.name} in Alaska`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,15,30,0.35)_0%,rgba(8,15,30,0)_55%)]"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black tracking-tight text-slate-950">{type.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{type.copy}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-700 group-hover:text-cyan-600">
                  Compare options
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

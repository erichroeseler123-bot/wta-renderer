import Link from "next/link";

const FEATURED = [
  {
    title: "Glacier Landing Experience",
    desc: "Touch down on the ice with a safety-first operator and unbeatable views.",
    tag: "Juneau • Helicopter",
    href: "/tours",
  },
  {
    title: "Dog Sled Tour + Glacier Landing",
    desc: "Classic Alaska: dogsledding on snow with a glacier landing add-on.",
    tag: "Juneau • Glacier",
    href: "/tours",
  },
  {
    title: "Private Icefield Charter",
    desc: "Go premium: flexible timing, private group, and maximum scenery.",
    tag: "Juneau • Private",
    href: "/tours",
  },
];

const STEPS = [
  {
    k: "1",
    t: "Pick a port & day",
    d: "Juneau, Ketchikan, Skagway… start with where you dock.",
  },
  {
    k: "2",
    t: "Add tours to itinerary",
    d: "Tap “Add to itinerary” from any tour card.",
  },
  {
    k: "3",
    t: "Checkout when ready",
    d: "We guide you to the supplier checkout (per operator).",
  },
];

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}

function SectionHeading({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="h2">{title}</h2>
        {desc ? <p className="p mt-2 max-w-2xl">{desc}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(76,201,240,0.16),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_40%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
          <div className="absolute -top-28 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-[#4CC9F0]/10 blur-3xl" />
        </div>

        <div className="relative container-pad pt-14 sm:pt-16 pb-8 sm:pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>Live inventory (FareHarbor)</Chip>
            <Chip>Multi-stop itinerary</Chip>
            <Chip>Ports • Tours • Logistics</Chip>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            {/* left */}
            <div className="lg:col-span-8">
              <h1 className="h1">
                Alaska tours that{" "}
                <span className="text-white">actually fit</span> your port day.
              </h1>

              <p className="p mt-5 max-w-2xl">
                Browse real options, compare meeting points + duration, and
                build a clean itinerary you can share with your group.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tours" className="btn btn-primary">
                  Explore tours →
                </Link>
                <Link href="/checkout" className="btn">
                  View itinerary →
                </Link>
                <Link href="/about" className="btn">
                  How this works
                </Link>
              </div>
            </div>

            {/* right: “how it works” mini-panel */}
            <div className="lg:col-span-4">
              <div className="card card-pad">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-white">
                    Fast plan builder
                  </div>
                  <span className="chip">3 steps</span>
                </div>

                <ol className="mt-4 space-y-3">
                  {STEPS.map((s) => (
                    <li key={s.k} className="flex gap-3">
                      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/90">
                        {s.k}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {s.t}
                        </div>
                        <div className="mt-1 text-sm text-white/65 leading-relaxed">
                          {s.d}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/tours"
                    className="btn btn-primary w-full justify-center"
                  >
                    Start with Tours →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* trust row */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="card card-pad">
              <div className="text-sm font-semibold">Port-time reality</div>
              <p className="p mt-2">
                Built around dock location, duration, and the “last possible
                chance” rule.
              </p>
            </div>
            <div className="card card-pad">
              <div className="text-sm font-semibold">Cleaner decisions</div>
              <p className="p mt-2">
                Compare meeting points + return buffers without reading 30 tabs
                of hype.
              </p>
            </div>
            <div className="card card-pad">
              <div className="text-sm font-semibold">Operator checkout</div>
              <p className="p mt-2">
                We guide you to the supplier’s checkout, per operator, when
                you’re ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-pad py-10 sm:py-14">
        <SectionHeading
          title="Featured experiences"
          desc="“Safe bet” categories that fit most Juneau port days. Real inventory lives on the Tours page."
          action={
            <Link href="/tours" className="btn">
              See all tours →
            </Link>
          }
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {FEATURED.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group card card-pad hover:bg-white/[0.08] transition"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="chip">{c.tag}</span>
                <span className="text-sm font-semibold text-blue-300/90 group-hover:text-blue-200">
                  View →
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white leading-snug">
                {c.title}
              </h3>
              <p className="p mt-3">{c.desc}</p>

              <div className="mt-6 flex items-center gap-2 text-sm text-white/65">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#4CC9F0]/80" />
                Live availability on Tours
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="container-pad pb-14">
        <div className="card card-pad">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xl md:text-2xl font-semibold tracking-tight">
                Ready to build your port-day plan?
              </div>
              <div className="mt-2 text-white/70">
                Add multiple tours, keep notes for your group, then checkout per
                supplier.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/tours" className="btn btn-primary">
                Browse tours →
              </Link>
              <Link href="/checkout" className="btn">
                Open itinerary →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-white/55">
          Want the “Ports → pick your dock window” flow? Add it as a first-class
          step on{" "}
          <Link className="link" href="/tours">
            Tours
          </Link>{" "}
          and feed the itinerary from there.
        </div>
      </section>
    </main>
  );
}

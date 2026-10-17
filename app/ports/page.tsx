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
              Check disembarkation margins, compare what each Inside Passage stop does best, and view compatible excursions tailored to your port window for Juneau, Skagway, and Ketchikan.
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
              Multi-Port Cruise Strategy
            </div>
            <h2
              id="port-decision-comparison-heading"
              className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl"
            >
              What Each Alaska Port Does Best (So You Don&apos;t Book the Same Tour Twice)
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              When your ship calls at Juneau, Skagway, and Ketchikan on the same voyage, match each port to its signature geographic specialty first. Use this side-by-side planner to avoid duplicating similar boat rides or flight paths across your cruise week.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                    Juneau
                  </span>
                  <span className="text-[11px] font-bold text-sky-800">Whales &amp; Glacier Ice</span>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Humpback Whale Watching, Mendenhall Glacier &amp; Icefield Helicopters
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                  <li>
                    <strong className="font-black text-slate-950">Humpback whale watching:</strong> Auke Bay &amp; Favorite Channel feeding waters offer 100% sighting guarantees ($165–$195 standalone; $245–$295 with Mendenhall).
                  </li>
                  <li>
                    <strong className="font-black text-slate-950">Mendenhall Glacier &amp; icefield helicopter landings:</strong> Walk to Nugget Falls ($45–$95 shuttle/tour) or land by helicopter on Herbert, Norris, or Mendenhall Glacier ($409–$429 flat rate).
                  </li>
                  <li>
                    <strong className="font-black text-slate-950">Save for other ports:</strong> Book your primary whale boat and glacier walk here; save mountain rail for Skagway and floatplanes/totems for Ketchikan.
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  1-Click Shortlists &amp; Guide
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/plan?port=juneau&topic=wildlife-whales&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl bg-sky-800 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-900"
                  >
                    Whale /plan shortlist →
                  </Link>
                  <Link
                    href="/plan?port=juneau&topic=glaciers&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Glacier &amp; heli /plan →
                  </Link>
                  <Link
                    href="/ports/juneau"
                    className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-950 transition hover:bg-sky-100"
                  >
                    Juneau port guide →
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
                  <span className="text-[11px] font-bold text-sky-800">Rail, Summit &amp; Huskies</span>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  White Pass &amp; Yukon Route Rail, Klondike Summit &amp; Sled-Dog Camps
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                  <li>
                    <strong className="font-black text-slate-950">White Pass &amp; Yukon Route rail:</strong> Historic narrow-gauge mountain railway climbing steep cliffside trestles above the 1898 Trail of &apos;98.
                  </li>
                  <li>
                    <strong className="font-black text-slate-950">Klondike summit &amp; sled-dog camps:</strong> Pair White Pass summit overlooks and Liarsville Gold Rush camp ($65–$95) with Dyea wheeled sled-dog camps ($140–$180) or the $599 Denver Glacier helicopter dogsledding demonstration (guests observe the demonstration only—no sled riding).
                  </li>
                  <li>
                    <strong className="font-black text-slate-950">Save for other ports:</strong> Skip marine wildlife cruises in upper Lynn Canal—do whales in Juneau and dedicate Skagway to rail, summit routes, and sled dogs.
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  1-Click Shortlists &amp; Guide
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/plan?port=skagway&topic=best-overall&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl bg-sky-800 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-900"
                  >
                    Skagway /plan shortlist →
                  </Link>
                  <Link
                    href="/plan?port=skagway&topic=dog-sledding&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Sled-dog /plan →
                  </Link>
                  <Link
                    href="/ports/skagway"
                    className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-950 transition hover:bg-sky-100"
                  >
                    Skagway port guide →
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
                  <span className="text-[11px] font-bold text-sky-800">Floatplanes, Crab &amp; Totems</span>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Misty Fjords Floatplanes, Bering Sea Crab Boat &amp; Totem Parks
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                  <li>
                    <strong className="font-black text-slate-950">Misty Fjords floatplanes:</strong> Bush seaplane flightseeing over 3,000-foot granite cliffs with an alpine lake or fjord pontoon landing ($330–$395, 1.5–2h).
                  </li>
                  <li>
                    <strong className="font-black text-slate-950">Bering Sea crab boat &amp; totem parks:</strong> Live King crab &amp; bald eagle deck excursions, Herring Cove black bears ($120–$180), and Saxman Native Village / Totem Bight totem parks.
                  </li>
                  <li>
                    <strong className="font-black text-slate-950">Save for other ports:</strong> Ketchikan has no roadside glaciers—book glacier landings in Juneau/Skagway and save Ketchikan for floatplanes, crab boats, bears, and totems.
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  1-Click Shortlists &amp; Guide
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/plan?port=ketchikan&topic=flightseeing&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl bg-sky-800 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-900"
                  >
                    Misty Fjords /plan →
                  </Link>
                  <Link
                    href="/plan?port=ketchikan&topic=wildlife-whales&sourcePage=/ports"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-100"
                  >
                    Wildlife /plan shortlist →
                  </Link>
                  <Link
                    href="/ports/ketchikan"
                    className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-950 transition hover:bg-sky-100"
                  >
                    Ketchikan port guide →
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <caption className="sr-only">
                Side-by-side comparison of what Juneau, Skagway, and Ketchikan do best for multi-port Alaska cruise visitors
              </caption>
              <thead className="sr-only md:not-sr-only md:border-b md:border-slate-200 md:bg-slate-950 md:text-[11px] md:font-black md:uppercase md:tracking-[0.16em] md:text-cyan-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Port &amp; Best Role</th>
                  <th scope="col" className="px-5 py-3.5">Signature #1 &amp; #2 to Book Here</th>
                  <th scope="col" className="px-5 py-3.5">Skip Here / Save for Another Port</th>
                  <th scope="col" className="px-5 py-3.5">Dock Logistics &amp; Buffer</th>
                  <th scope="col" className="px-5 py-3.5">Direct Action Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="block p-4 md:table-row md:p-0">
                  <th scope="row" className="block font-black text-slate-950 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="text-base md:text-sm">Juneau</span>
                    <span className="mt-0.5 block text-[11px] font-bold text-sky-800">Whales &amp; Glacier Ice</span>
                  </th>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Book Here:</span>
                    Auke Bay humpback whale watching ($165–$195), Mendenhall Glacier combos ($245–$295), and Juneau Icefield helicopter glacier landings ($409–$429).
                  </td>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Avoid Duplicating:</span>
                    Skip generic town trolleys—save historic rail for Skagway and totem parks or bush floatplanes for Ketchikan.
                  </td>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Dock &amp; Buffer:</span>
                    Mt. Roberts Tram Plaza pickup (AJ Dock uses 5-min shuttle). Keep a 45–60 min all-aboard buffer.
                  </td>
                  <td className="mt-3 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link href="/plan?port=juneau&topic=best-overall&sourcePage=/ports" className="font-black text-sky-800 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-950">
                        Juneau /plan shortlist
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link href="/ports/juneau" className="font-bold text-slate-700 hover:underline">
                        /ports/juneau
                      </Link>
                    </div>
                  </td>
                </tr>

                <tr className="block bg-slate-50/70 p-4 md:table-row md:p-0">
                  <th scope="row" className="block font-black text-slate-950 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="text-base md:text-sm">Skagway</span>
                    <span className="mt-0.5 block text-[11px] font-bold text-sky-800">Rail, Summit &amp; Sled Dogs</span>
                  </th>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Book Here:</span>
                    White Pass &amp; Yukon Route narrow-gauge rail, Klondike summit &amp; 1898 Gold Rush camps ($65–$120), plus Dyea wheeled sled-dog camps ($140–$180) or the $599 Denver Glacier helicopter dogsledding demonstration (observation only, no riding).
                  </td>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Avoid Duplicating:</span>
                    Don&apos;t book whale watching in upper Lynn Canal—do whales in Juneau and keep Skagway for mountain rail, summit overlooks, and huskies.
                  </td>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Dock &amp; Buffer:</span>
                    5–15 min flat walk from Ore/Broadway Docks (shuttle at Railroad Dock). Keep 45+ min return cushion.
                  </td>
                  <td className="mt-3 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link href="/plan?port=skagway&topic=best-overall&sourcePage=/ports" className="font-black text-sky-800 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-950">
                        Skagway /plan shortlist
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link href="/ports/skagway" className="font-bold text-slate-700 hover:underline">
                        /ports/skagway
                      </Link>
                    </div>
                  </td>
                </tr>

                <tr className="block p-4 md:table-row md:p-0">
                  <th scope="row" className="block font-black text-slate-950 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="text-base md:text-sm">Ketchikan</span>
                    <span className="mt-0.5 block text-[11px] font-bold text-sky-800">Floatplanes, Crab &amp; Totems</span>
                  </th>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Book Here:</span>
                    Misty Fjords floatplanes with water landing ($330–$395), Bering Sea crab boat &amp; Herring Cove black bears ($120–$215), and Saxman / Totem Bight totem parks.
                  </td>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Avoid Duplicating:</span>
                    No roadside glaciers in Ketchikan—save glacier ice walks for Juneau/Skagway and prioritize floatplanes, crab boats, bears, and totems here.
                  </td>
                  <td className="mt-2 block text-slate-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 md:hidden">Dock &amp; Buffer:</span>
                    Berths 1–4 step right downtown (45–60 min buffer); Ward Cove is 9 mi north via 20-min shuttle (allow 90-min buffer).
                  </td>
                  <td className="mt-3 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link href="/plan?port=ketchikan&topic=best-overall&sourcePage=/ports" className="font-black text-sky-800 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-950">
                        Ketchikan /plan shortlist
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link href="/ports/ketchikan" className="font-bold text-slate-700 hover:underline">
                        /ports/ketchikan
                      </Link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

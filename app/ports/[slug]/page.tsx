import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { CRUISE_ITINERARY_HINTS, type CruiseShipName } from "@/lib/cruiseShips";
import { parseTimeToMinutes, formatMinutesToTime } from "@/lib/timing";

const APPROVED_PORTS = [
  "juneau",
  "skagway",
  "ketchikan",
  "sitka",
  "icy-strait-point",
  "haines",
  "seward",
  "whittier"
];

const PORT_INFO: Record<string, { title: string; description: string; problem: string }> = {
  juneau: {
    title: "Juneau Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Find the best Juneau glacier helicopter, dog sledding, or whale watching tours that fit your ship's port day window.",
    problem: "Juneau is a busy port day with tight excursion time slots. Booking a glacier helicopter tour or whale watch requires careful alignment with your ship's all-aboard time to guarantee a safe return."
  },
  skagway: {
    title: "Skagway Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Plan your Skagway shore excursions, train rides, and active tours based on your cruise ship's port day timetable.",
    problem: "Skagway's railway and helicopter tours operate on rigid schedules. Navigating train transfer timing and tour durations without overlapping your ship's all-aboard window is a common cruise challenge."
  },
  ketchikan: {
    title: "Ketchikan Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Compare Ketchikan rainforest tours, kayak adventures, and wilderness excursions that sync with your port schedule.",
    problem: "Ketchikan is known for sudden weather changes and remote wilderness excursions. Selecting the right tour depends on tracking precise transfer times to and from the cruise docks safely."
  },
  sitka: {
    title: "Sitka Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Choose Sitka wildlife tours, marine excursions, and historic sights tailored to your cruise ship arrival and departure.",
    problem: "Sitka's cruise docks are located outside the main town area, meaning travelers factor in shuttle transfer times when aligning excursion end times with their ship's all-aboard deadline."
  },
  "icy-strait-point": {
    title: "Icy Strait Point Excursions | Welcome To Alaska Tours",
    description: "Find Icy Strait Point ziprider, whale watching, and native heritage tours that fit your ship's port day timeline.",
    problem: "Icy Strait Point offers high-adventure excursions but limited time blocks. Ensuring your whale watching or ziprider trip doesn't conflict with ship timing is critical for a stress-free day."
  },
  haines: {
    title: "Haines Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Discover Haines rafting, wildlife, and cultural excursions that align with your cruise ship schedule.",
    problem: "Haines often requires ferry transfers if your ship is docked in Skagway, or has limited local tour slots. Timing your excursions requires tracking both ferry and ship schedules carefully."
  },
  seward: {
    title: "Seward Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Plan your Seward fjord cruises, glacier tours, and hiking trips matching your ship's departure timing.",
    problem: "Seward serves as a major turnaround port where travelers are either embarking, disembarking, or visiting for a single port day. Coordinating land transfers and boat tours is highly timing-sensitive."
  },
  whittier: {
    title: "Whittier Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Compare Whittier glacier cruises and tunnel-dependent excursions that safely fit your cruise schedule.",
    problem: "Whittier is accessed via a single-lane shared tunnel with strict hourly opening schedules. Miscalculating tunnel transit times can lead to missing your tour or your ship's all-aboard time."
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!APPROVED_PORTS.includes(slug)) {
    return {};
  }
  const info = PORT_INFO[slug];
  return {
    title: info.title,
    description: info.description,
    alternates: {
      canonical: `https://welcometoalaskatours.com/ports/${slug}`
    }
  };
}

export default async function PortPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  if (!APPROVED_PORTS.includes(slug)) {
    notFound();
  }

  const resolvedSearch = await searchParams;
  const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? String(value[0] || "") : String(value || "");
  const cruiseShip = getParam(resolvedSearch.cruiseShip);

  const info = PORT_INFO[slug];
  const portTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Resolve ship timings
  let shipArrival: string | undefined = getParam(resolvedSearch.arrivalTime);
  let shipDeparture: string | undefined = getParam(resolvedSearch.departureTime);
  let shipWindow: string | undefined = shipArrival && shipDeparture ? `${shipArrival} - ${shipDeparture}` : undefined;

  if (!shipArrival && !shipDeparture && cruiseShip && CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName]) {
    const hint = CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName]!;
    if (hint.portSlug === slug) {
      const windowMatch = hint.window.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
      if (windowMatch) {
        shipArrival = windowMatch[1];
        shipDeparture = windowMatch[2];
        shipWindow = hint.window;
      }
    }
  }

  // Resolve tours for this port
  const allTours = await getHelicopterTours().catch(() => []);
  const portTours = allTours.filter((t) => t.port === slug);
  const hasLiveTours = portTours.length > 0;

  const evaluatedTours = portTours.map((tour) => {
    // Parse duration from description
    const durationMatch = String(tour.description || "").match(/\b(\d+(?:\.\d+)?)\s*Hours?\b/i);
    const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 0;
    const durationMinutes = Math.round(durationHours * 60);

    let timingStatus: "safe" | "tight" | "unsafe" | "unknown" = "unknown";
    let timingGuidanceText = "Enter or confirm your ship timing before relying on this fit.";

    if (shipArrival && shipDeparture) {
      if (durationMinutes > 0) {
        const arrMin = parseTimeToMinutes(shipArrival);
        const depMin = parseTimeToMinutes(shipDeparture);
        if (arrMin !== null && depMin !== null) {
          const allAboardMin = depMin - 30;
          const earliestSafeStart = arrMin + 45;
          const latestSafeStart = allAboardMin - durationMinutes - 45;

          if (latestSafeStart >= earliestSafeStart) {
            timingStatus = "safe";
            timingGuidanceText = "Appears to fit your port window with a return buffer.";
          } else if (allAboardMin - arrMin >= durationMinutes) {
            timingStatus = "tight";
            timingGuidanceText = "This may be tight. Confirm your ship’s all-aboard time before booking.";
          } else {
            timingStatus = "unsafe";
            timingGuidanceText = "This may not fit your ship schedule with the recommended return buffer.";
          }
        }
      }
    }

    return {
      ...tour,
      timingStatus,
      timingGuidanceText,
      // Priority: safe (3) > tight (2) > unknown (1) > unsafe (0)
      priority: timingStatus === "safe" ? 3 : timingStatus === "tight" ? 2 : timingStatus === "unknown" ? 1 : 0,
    };
  });

  // Sort evaluated tours: safer matches first
  if (shipArrival && shipDeparture) {
    evaluatedTours.sort((a, b) => b.priority - a.priority);
  }

  // Resolve ship timings
  let shipArrivalResolved: string | undefined = shipArrival;
  let shipDepartureResolved: string | undefined = shipDeparture;
  let shipWindowResolved: string | undefined = shipWindow;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearch)) {
    if (typeof value === "string" && value) qs.set(key, value);
  }
  if (!qs.get("port")) qs.set("port", slug);
  if (!qs.get("intent")) qs.set("intent", "best-for");
  if (!qs.get("topic")) qs.set("topic", "shore-excursions");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/ports"
          className="inline-flex rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white"
        >
          Back to ports
        </Link>

        {/* Hero Section */}
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Port Guide
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {portTitle} Shore Excursions
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/82 sm:text-[15px]">
              Decision-first excursion routing. Review safety buffers, check live calendars, and match excursions to your ship's schedule in {portTitle}.
            </p>
          </div>
        </section>

        {/* Cruise Day timing helper panel */}
        {cruiseShip && shipWindowResolved ? (
          <section className="mt-6 rounded-[2rem] border border-sky-200 bg-sky-50/50 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-sky-800">
              Cruise Day Schedule Resolved
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              <strong>{cruiseShip}</strong> is scheduled in {portTitle} from <strong>{shipArrivalResolved}</strong> to <strong>{shipDepartureResolved}</strong> ({shipWindowResolved}).
              All excursions should depart at least 45 minutes after arrival and return at least 45 minutes before the ship's all-aboard time.
            </p>
          </section>
        ) : (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
              Confirm Your Ship Timing
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter or confirm your ship timing before relying on this fit. Excursions should leave a 45-minute return buffer before your ship's all-aboard time. You can browse specific timing guidelines for ships like the <Link href="/ships/celebrity-edge" className="font-bold underline">Celebrity Edge</Link> or <Link href="/ships/norwegian-bliss" className="font-bold underline">Norwegian Bliss</Link> in our <Link href="/ships" className="font-bold underline">cruise ship planners directory</Link>.
            </p>
          </section>
        )}        {/* Juneau Excursion Categories */}
        {slug === "juneau" && (
          <section className="mt-8">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Excursion Categories in Juneau</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/categories/juneau-helicopter-tours"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 transition duration-200 shadow-sm hover:shadow block"
              >
                <h3 className="font-bold text-slate-900">Helicopter Tours</h3>
                <p className="mt-1 text-xs text-slate-500">Compare icefield flight paths & glacier landings.</p>
              </Link>
              <Link
                href="/categories/glacier-tours"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 transition duration-200 shadow-sm hover:shadow block"
              >
                <h3 className="font-bold text-slate-900">Glacier Ice Treks</h3>
                <p className="mt-1 text-xs text-slate-500">Active glacier walks & guided ice climbs.</p>
              </Link>
              <Link
                href="/categories/dog-sledding"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 transition duration-200 shadow-sm hover:shadow block"
              >
                <h3 className="font-bold text-slate-900">Glacier Dog Sledding</h3>
                <p className="mt-1 text-xs text-slate-500">Helicopter shuttles to remote musher camps.</p>
              </Link>
              <Link
                href="/categories/whale-watching"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 transition duration-200 shadow-sm hover:shadow block"
              >
                <h3 className="font-bold text-slate-900">Whale Watching</h3>
                <p className="mt-1 text-xs text-slate-500">Spot humpback whales in Auke Bay.</p>
              </Link>
              <Link
                href="/categories/mendenhall-glacier"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 transition duration-200 shadow-sm hover:shadow block"
              >
                <h3 className="font-bold text-slate-900">Mendenhall Glacier</h3>
                <p className="mt-1 text-xs text-slate-500">Visitor center hikes & lake views.</p>
              </Link>
              <Link
                href="/categories/flightseeing"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 transition duration-200 shadow-sm hover:shadow block"
              >
                <h3 className="font-bold text-slate-900">Flightseeing</h3>
                <p className="mt-1 text-xs text-slate-500">Icefield flight paths and floatplanes.</p>
              </Link>
            </div>
          </section>
        )}

        {/* Live Tour Offerings or Honest Fallback */}
        <section className="mt-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Live Shore Excursions</h2>
            {hasLiveTours && (
              <span className="rounded bg-sky-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                Live Availability
              </span>
            )}
          </div>

          {hasLiveTours ? (
            <div className="grid gap-6 md:grid-cols-2">
              {evaluatedTours.map((tour) => {
                const tourQs = new URLSearchParams(qs.toString());
                tourQs.set("productSlug", tour.slug);

                return (
                  <div
                    key={tour.pk}
                    className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.08)] flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-100">
                      <img
                        src={tour.image || "/hero/juneau.jpg"}
                        alt={tour.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          {tour.category || "Juneau Excursion"}
                        </span>
                        <h3 className="text-xl font-black tracking-tight text-slate-900">{tour.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3">{tour.description}</p>
                      </div>
                      {tour.timingStatus !== "unknown" && (
                        <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                          tour.timingStatus === "safe" ? "border-emerald-200 bg-emerald-50 text-emerald-955" :
                          tour.timingStatus === "tight" ? "border-amber-200 bg-amber-50 text-amber-955" :
                          "border-rose-200 bg-rose-50 text-rose-955"
                        }`}>
                          {tour.timingStatus === "safe" ? "✅ " : tour.timingStatus === "tight" ? "⚠️ " : "❌ "}
                          {tour.timingGuidanceText}
                        </div>
                      )}
                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <span className="text-lg font-black text-slate-900">{tour.fromPrice || "Check Price"}</span>
                        <Link
                          href={`/tours/${tour.company}/${tour.pk}?${tourQs.toString()}`}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                        >
                          View Excursion
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-4">
              <p className="text-sm leading-relaxed text-slate-600 max-w-xl mx-auto">
                We are building this port’s live excursion set. Currently, our live FareHarbor integration only offers active products in Juneau. Start with our timing guidance tool or check live availability in Juneau.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center">
                <Link
                  href={`/plan?${qs.toString()}`}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Configure Timing Guidance
                </Link>
                <Link
                  href="/tours"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Browse Live Alaska Tours
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* The Decision Problem */}
        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-955">The Port-Day Decision Problem</h2>
          <p className="mt-4 text-sm leading-7 text-slate-655">
            {info.problem}
          </p>
          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Safety First</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Never book a tour that doesn't leave at least a <strong>45-minute return buffer</strong> before your cruise ship's scheduled all-aboard time (30 minutes prior to departure).
            </p>
            {["juneau", "skagway", "ketchikan", "sitka", "icy-strait-point", "haines"].includes(slug) && (
              <div className="mt-3 pt-3 border-t border-sky-100">
                <Link
                  href={`/guides/how-long-does-it-take-to-get-off-the-ship-in-${slug}`}
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-sky-800 hover:text-sky-900 transition"
                >
                  Read disembarkation & timing guide for {portTitle} →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Action cards */}
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href={`/plan?${qs.toString()}`}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 block"
          >
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Interactive Chooser</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Match Excursions to Ship Window</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Input your cruise line, ship, and date to calculate timing safety buffers and see a scored shortlist of matching tours.
            </p>
            <div className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-700">Launch chooser</div>
          </Link>

          <Link
            href="/tours"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 block"
          >
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Browse Catalog</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">View All Excursions</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Explore the complete catalog of excursions, view operator details, and check live availability directly on the calendar.
            </p>
            <div className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-700">Browse tours</div>
          </Link>
        </section>
      </div>
    </main>
  );
}

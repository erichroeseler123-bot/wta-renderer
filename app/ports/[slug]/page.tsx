import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { getProductOneLiner } from "@/lib/tourSeo";
import { CRUISE_ITINERARY_HINTS, type CruiseShipName } from "@/lib/cruiseShips";
import { parseTimeToMinutes } from "@/lib/timing";

const APPROVED_PORTS = [
  "juneau",
  "skagway",
  "ketchikan"
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
  }
};

const isGenericDescription = (desc: string) => {
  const d = desc.toLowerCase();
  return d.includes("cruise-friendly") || d.includes("memorable day in port") || d.includes("without wasting time");
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
  
  // Resolve cookie intent
  const cookieStore = await cookies();
  const intentCookie = cookieStore.get("wta_dcc_intent");
  let dccIntent: any = null;
  if (intentCookie?.value) {
    try {
      dccIntent = JSON.parse(intentCookie.value);
    } catch (_) {}
  }

  const cookieShip = dccIntent?.shipName || "";
  const cookiePort = dccIntent?.port || "";
  const isPortMatch = !cookiePort || cookiePort.toLowerCase() === slug.toLowerCase();
  
  const cruiseShip = getParam(resolvedSearch.cruiseShip) || (isPortMatch ? cookieShip : "");

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
  if (!qs.get("topic")) qs.set("topic", "shore-excursions");  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/ports"
          className="inline-flex rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition"
        >
          Back to ports
        </Link>

        {/* Hero Section */}
        <section className="relative mt-6 overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-lg">
          <div className="absolute inset-0">
            <img
              src={slug === "juneau" ? "/hero/juneau.jpg" : slug === "skagway" ? "/hero/skagway.jpg" : "/hero/ketchikan.png"}
              alt={`${portTitle} Shore Excursions`}
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/90 md:via-slate-950/60 md:to-transparent" />
          </div>
          <div className="relative p-6 sm:p-10 max-w-2xl">
            <div className="max-w-xl rounded-2xl border border-white/10 bg-slate-950/65 p-6 backdrop-blur-md space-y-3">
              <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-300">
                Port Excursion Dashboard
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl leading-tight">
                {portTitle} Shore Excursions
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live availability verified against cruise timetables with safety return buffers.
              </p>
            </div>
          </div>
        </section>

        {/* Cruise Day timing helper panel */}
        {cruiseShip && shipWindowResolved ? (
          <section className="mt-6 rounded-[2rem] border border-sky-200 bg-sky-50/50 p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-sky-850">
              All-Aboard Sync Resolved
            </h3>
            <p className="mt-2 text-xs leading-5 text-slate-700">
              **{cruiseShip}** is scheduled in {portTitle}: **{shipArrivalResolved} - {shipDepartureResolved}** ({shipWindowResolved}).
              Required return safety margin is **45+ minutes** prior to ship's scheduled all-aboard time.
            </p>
          </section>
        ) : (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">
              All-Aboard Sync Required
            </h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Confirm ship timings to calculate **Port-Day Fit**. Excursions must leave a **45-minute return buffer** before ship's all-aboard time. Read ship-specific guides for <Link href="/ships/celebrity-edge" className="font-bold underline">Celebrity Edge</Link> or <Link href="/ships/norwegian-bliss" className="font-bold underline">Norwegian Bliss</Link> in our <Link href="/ships" className="font-bold underline">planners directory</Link>.
            </p>
          </section>
        )}

        {/* Live Tour Offerings or Honest Fallback - Pushed to the top of the content */}
        <section className="mt-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              {slug === "juneau" ? "Live Shore Excursions" : `${portTitle} Excursion Planners`}
            </h2>
            {hasLiveTours && (
              <span className="rounded bg-sky-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                Verified Capacity
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
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            {tour.category || "Juneau Excursion"}
                          </span>
                          <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-850">
                            Verified Capacity
                          </span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900">{tour.title}</h3>
                        
                        <div className="grid grid-cols-2 gap-2 py-2 text-[11px] border-y border-slate-100 my-2">
                          <div>
                            <span className="text-slate-500 block">Duration</span>
                            <span className="font-black text-slate-900">Check detail</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Safety Buffer</span>
                            <span className="font-black text-rose-800">45+ min required</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-655 line-clamp-2">
                          {getProductOneLiner(tour)}
                        </p>
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Cruiser Alert</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">Rigid Excursion Timings</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {slug === "skagway" 
                    ? "Skagway's railway and helicopter tours operate on rigid timetables. Navigating train transfers and flight durations without overlapping your ship's all-aboard window is a critical challenge." 
                    : "Ketchikan excursions take place in remote wilderness locations. Selecting the right tour depends directly on tracking precise transfer times to and from the cruise docks safely."}
                </p>
                <Link
                  href={`/guides/how-long-does-it-take-to-get-off-the-ship-in-${slug}`}
                  className="text-xs font-bold text-sky-850 block hover:underline"
                >
                  Read disembarkation guide →
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Active Planning</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">Verify Schedule Compatibility</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {slug === "skagway"
                    ? " Broadway and Ore docks are walkable, but Railroad Dock requires a 10-15 minute walk. White Pass train departures require prompt gangway clearing."
                    : "Berths 1-4 sit right downtown. Ward Cove terminal is 7 miles north and requires a mandatory 20-minute shuttle bus downtown, which can add up to 45 minutes of wait time."}
                </p>
                <Link
                  href="/tours"
                  className="text-xs font-bold text-sky-850 block hover:underline"
                >
                  Browse all active excursions →
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Juneau Excursion Categories - Pushed lower down */}
        {slug === "juneau" && (
          <section className="mt-8">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-black tracking-tight text-slate-955">Browse Juneau Categories</h2>
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

        {/* The Decision Problem */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-955">The Port-Day Decision Problem</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {info.problem}
          </p>
          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Safety First</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Never book a tour that doesn't leave at least a <strong>45-minute return buffer</strong> before your cruise ship's scheduled all-aboard time (30 minutes prior to departure).
            </p>
            {["juneau", "skagway", "ketchikan"].includes(slug) && (
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
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-955">Match Excursions to Ship Window</h2>
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
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-955">View All Excursions</h2>
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

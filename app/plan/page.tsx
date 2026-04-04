import type { Metadata } from "next";
import Link from "next/link";
import { getHelicopterToursSnapshot, type HelicopterTour } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";
import PlanTelemetry from "@/app/components/plan/PlanTelemetry";

export const metadata: Metadata = {
  title: "Choose Your Best Alaska Tour | Welcome To Alaska Tours",
  description:
    "A scored Alaska chooser that reads cruise-day context, narrows the lane, and recommends the best-fit Juneau tours before booking.",
  alternates: { canonical: "https://welcometoalaskatours.com/plan" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Packet = {
  port: string;
  topic: string;
  subtype: string;
  party: string;
  budget: string;
  window: string;
  urgency: string;
  mobility: string;
  source: string;
  sourcePage: string;
};

type LaneKey =
  | "best-overall"
  | "short-window"
  | "family-friendly"
  | "easy"
  | "whale-first"
  | "glacier-first"
  | "premium"
  | "best-value";

type Lane = {
  key: LaneKey;
  label: string;
  summary: string;
  inventoryNote?: string;
};

type Recommendation = {
  tour: HelicopterTour;
  score: number;
  whyFits: string;
  tradeoff: string;
  duration: string;
  effort: string;
  pricing: string;
  availability: string;
  bestFor: string;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

function normalize(value: string | undefined) {
  return String(value || "").trim().toLowerCase();
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parsePacket(searchParams: Record<string, string | string[] | undefined>): Packet {
  return {
    port: normalize(readParam(searchParams.port)),
    topic: normalize(readParam(searchParams.topic)),
    subtype: normalize(readParam(searchParams.subtype)),
    party: normalize(readParam(searchParams.party || searchParams.partyType)),
    budget: normalize(readParam(searchParams.budget || searchParams.budgetBand)),
    window: normalize(readParam(searchParams.window || searchParams.timeWindow)),
    urgency: normalize(readParam(searchParams.urgency)),
    mobility: normalize(readParam(searchParams.mobility)),
    source: normalize(readParam(searchParams.source)),
    sourcePage: readParam(searchParams.sourcePage).trim(),
  };
}

function parseDurationHours(text: string | undefined) {
  const raw = String(text || "");
  const decimalMatch = raw.match(/(\d+(?:\.\d+)?)\s*hours?/i);
  if (decimalMatch) return Number(decimalMatch[1]);

  const mixedMatch = raw.match(/(\d+)\s*hours?(?:\s*&\s*(\d+)\s*minutes?)?/i);
  if (!mixedMatch) return null;

  const hours = Number(mixedMatch[1] || 0);
  const minutes = Number(mixedMatch[2] || 0);
  return hours + minutes / 60;
}

function parseDurationLabel(text: string | undefined) {
  const raw = String(text || "").trim();
  if (!raw) return "Timing varies";
  const first = raw.split("•")[0]?.trim();
  return first || "Timing varies";
}

function parseAgeMinimum(text: string | undefined) {
  const raw = String(text || "");
  if (/all ages/i.test(raw)) return 0;
  const ageMatch = raw.match(/ages?\s*(\d+)\+/i);
  if (!ageMatch) return null;
  return Number(ageMatch[1]);
}

function parsePriceNumber(text: string | undefined) {
  const raw = String(text || "");
  const match = raw.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const dollars = Number(String(match[1]).replace(/,/g, ""));
  return Number.isFinite(dollars) ? dollars : null;
}

function inferEffort(tour: HelicopterTour) {
  const text = `${tour.title} ${tour.description || ""}`.toLowerCase();
  if (text.includes("activity level: light") || text.includes("all ages")) return "Easy";
  if (text.includes("trek") || text.includes("walkabout") || text.includes("airboat adventure")) {
    return "Moderate";
  }
  if (text.includes("dog sled")) return "Moderate";
  return "Easy";
}

function describePricing(price: number | null) {
  if (!price) return "Check live pricing";
  if (price <= 450) return "Best value in the live Juneau set";
  if (price <= 600) return "Mid-range once-in-a-lifetime pricing";
  if (price <= 750) return "Premium excursion pricing";
  return "Top-end splurge pricing";
}

function describeAvailability(tour: HelicopterTour) {
  if (tour.nextAvailableDate) return `Next posted date: ${tour.nextAvailableDate}`;
  if (tour.hasInventory === false) return "No live inventory posted right now";
  if (tour.hasInventory === true) return "Live inventory is posted now";
  return "Check the calendar for current departures";
}

function inferTags(tour: HelicopterTour) {
  const text = `${tour.title} ${tour.category || ""} ${tour.description || ""}`.toLowerCase();
  return {
    glacier: text.includes("glacier") || text.includes("icefield"),
    dogSled: text.includes("dog sled"),
    landing: text.includes("landing"),
    trek: text.includes("trek") || text.includes("walkabout"),
    scenic: text.includes("flightseeing") || text.includes("excursion") || text.includes("helicopter"),
    airboat: text.includes("airboat"),
  };
}

function inferRequestedLane(packet: Packet): LaneKey {
  const combined = `${packet.topic} ${packet.subtype}`;

  if (combined.includes("whale")) return "whale-first";
  if (packet.mobility.includes("easy") || packet.mobility.includes("low")) return "easy";
  if (packet.window.includes("2") || packet.window.includes("short") || packet.window.includes("4-hours")) return "short-window";
  if (packet.party.includes("family") || packet.party.includes("kids")) return "family-friendly";
  if (packet.budget.includes("premium") || combined.includes("once-in-a-lifetime")) return "premium";
  if (packet.budget.includes("value") || combined.includes("value")) return "best-value";
  if (combined.includes("glacier") || combined.includes("helicopter")) return "glacier-first";
  return "best-overall";
}

function chooseLane(packet: Packet): Lane {
  const combined = `${packet.topic} ${packet.subtype}`;

  if (packet.mobility.includes("easy") || packet.mobility.includes("low")) {
    return {
      key: "easy",
      label: "Easy / low-mobility",
      summary: "Low-friction tours with lighter activity and easier pacing.",
    };
  }

  if (packet.window.includes("2") || packet.window.includes("short") || packet.window.includes("4-hours")) {
    return {
      key: "short-window",
      label: "Short window",
      summary: "Tours that fit a tighter port window without dragging the day long.",
    };
  }

  if (packet.party.includes("family") || packet.party.includes("kids")) {
    return {
      key: "family-friendly",
      label: "Family-friendly",
      summary: "Shortlist tuned for broad age compatibility and easier group fit.",
    };
  }

  if (packet.budget.includes("premium") || combined.includes("once-in-a-lifetime")) {
    return {
      key: "premium",
      label: "Premium / once-in-a-lifetime",
      summary: "Highest-drama helicopter experiences with stronger splurge energy.",
    };
  }

  if (packet.budget.includes("value") || combined.includes("value")) {
    return {
      key: "best-value",
      label: "Best value",
      summary: "The strongest price-to-experience fits in the current live set.",
    };
  }

  if (combined.includes("whale")) {
    return {
      key: "whale-first",
      label: "Whale-first",
      summary: "Closest live scenic fits for a whale-leaning query.",
      inventoryNote:
        "Whale-first options are limited at the moment, so these are the closest live scenic fits given current availability.",
    };
  }

  if (combined.includes("glacier") || combined.includes("helicopter")) {
    return {
      key: "glacier-first",
      label: "Glacier-first",
      summary: "The strongest glacier and flightseeing fits in current Juneau inventory.",
    };
  }

  return {
    key: "best-overall",
    label: "Best overall",
    summary: "A balanced shortlist for first-pass Juneau excursion decisions.",
  };
}

function scoreTour(tour: HelicopterTour, packet: Packet, lane: Lane): Recommendation {
  const tags = inferTags(tour);
  const durationHours = parseDurationHours(tour.description);
  const duration = parseDurationLabel(tour.description);
  const ageMinimum = parseAgeMinimum(tour.description);
  const effort = inferEffort(tour);
  const price = parsePriceNumber(tour.fromPrice || tour.description);

  let score = 20;

  if (!packet.port || packet.port === tour.port) score += 35;
  else score -= 60;

  if (packet.window) {
    if ((packet.window.includes("2") || packet.window.includes("short")) && durationHours !== null) {
      score += durationHours <= 2.5 ? 22 : durationHours <= 3.5 ? 8 : -18;
    } else if (packet.window.includes("4") && durationHours !== null) {
      score += durationHours <= 4.25 ? 16 : 4;
    }
  }

  if (packet.party.includes("family") || packet.party.includes("kids")) {
    if (ageMinimum === 0 || (ageMinimum !== null && ageMinimum <= 8)) score += 24;
    else if (ageMinimum !== null && ageMinimum <= 12) score += 8;
    else score -= 18;
  }

  if (packet.mobility.includes("easy") || packet.mobility.includes("low")) {
    if (effort === "Easy") score += 22;
    else score -= 16;
  }

  if (packet.budget.includes("value") && price !== null) {
    score += price <= 450 ? 24 : price <= 550 ? 10 : -12;
  }

  if ((packet.budget.includes("premium") || lane.key === "premium") && price !== null) {
    score += price >= 680 ? 18 : price >= 520 ? 8 : -6;
  }

  if (lane.key === "glacier-first") {
    if (tags.glacier) score += 24;
    if (tags.landing) score += 8;
  } else if (lane.key === "whale-first") {
    if (effort === "Easy") score += 10;
    if (durationHours !== null && durationHours <= 3.0) score += 8;
    if (tags.dogSled) score -= 6;
  } else if (lane.key === "short-window") {
    if (durationHours !== null) {
      score += durationHours <= 2.5 ? 24 : durationHours <= 3.25 ? 10 : -14;
    }
  } else if (lane.key === "family-friendly") {
    if (ageMinimum === 0) score += 20;
    else if (ageMinimum !== null && ageMinimum <= 7) score += 14;
    if (tags.trek) score -= 10;
  } else if (lane.key === "easy") {
    if (effort === "Easy") score += 18;
    if (tags.trek) score -= 14;
  } else if (lane.key === "premium") {
    if (tags.dogSled || tags.airboat) score += 18;
    if (tags.landing) score += 8;
  } else if (lane.key === "best-value") {
    if (price !== null) score += price <= 430 ? 18 : price <= 500 ? 10 : -10;
  } else {
    if (tags.glacier) score += 10;
    if (tags.scenic) score += 8;
    if (effort === "Easy") score += 8;
  }

  if ((packet.urgency.includes("today") || packet.urgency.includes("soon")) && tour.nextAvailableDate) {
    score += 8;
  }

  if (durationHours !== null && durationHours > 4.25 && packet.window) {
    score -= 10;
  }

  const whyFits: string[] = [];
  if ((lane.key === "glacier-first" || lane.key === "best-overall") && tags.glacier) {
    whyFits.push("Strong glacier scenery fit");
  }
  if (lane.key === "family-friendly" && (ageMinimum === 0 || (ageMinimum !== null && ageMinimum <= 8))) {
    whyFits.push("Broader age compatibility for mixed groups");
  }
  if (lane.key === "short-window" && durationHours !== null && durationHours <= 3.25) {
    whyFits.push("Shorter timing for a tighter port call");
  }
  if (lane.key === "easy" && effort === "Easy") {
    whyFits.push("Lower-friction activity level");
  }
  if (lane.key === "premium" && (tags.dogSled || tags.airboat)) {
    whyFits.push("Big-experience splurge energy");
  }
  if (lane.key === "best-value" && price !== null && price <= 450) {
    whyFits.push("Lower entry price than most live helicopter options");
  }
  if (whyFits.length === 0 && effort === "Easy") {
    whyFits.push("Easy fit for a first Alaska helicopter tour");
  }
  if (whyFits.length === 0 && tags.scenic) {
    whyFits.push("Scenic flight emphasis without overcomplicating the day");
  }

  let tradeoff = "Premium price for the experience level.";
  if (price !== null && price <= 450) {
    tradeoff = "Lower price point, but less all-out spectacle than the splurge options.";
  } else if (tags.trek) {
    tradeoff = "More active than a pure flightseeing option.";
  } else if (tags.dogSled) {
    tradeoff = "Bigger commitment on price and pace than a simple glacier landing.";
  } else if (durationHours !== null && durationHours > 4) {
    tradeoff = "Longer block of the day, so schedule buffer matters more.";
  }

  let bestFor = "Cruise travelers wanting a clean Juneau helicopter pick.";
  if (lane.key === "family-friendly") {
    bestFor = "Families and mixed-age groups trying to avoid a mismatch.";
  } else if (lane.key === "short-window") {
    bestFor = "Travelers protecting a shorter port window.";
  } else if (lane.key === "easy") {
    bestFor = "Travelers prioritizing lighter activity and simpler logistics.";
  } else if (lane.key === "premium") {
    bestFor = "Travelers willing to spend more for a bigger story to remember.";
  } else if (lane.key === "best-value") {
    bestFor = "Travelers watching spend without dropping helicopter access.";
  }

  return {
    tour,
    score,
    whyFits: `${whyFits.join(". ")}.`,
    tradeoff,
    duration,
    effort,
    pricing: describePricing(price),
    availability: describeAvailability(tour),
    bestFor,
  };
}

function contextSummary(packet: Packet) {
  const parts = [
    packet.port ? titleCase(packet.port) : "Juneau",
    packet.window ? packet.window.replace(/-/g, " ") : "open timing",
    packet.party ? packet.party.replace(/-/g, " ") : "general travelers",
    packet.mobility ? packet.mobility.replace(/-/g, " ") : "standard mobility",
  ];
  return parts.join(" • ");
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const packet = parsePacket(await searchParams);
  const requestedLane = inferRequestedLane(packet);
  const lane = chooseLane(packet);
  const degradedFallback = Boolean(lane.inventoryNote);
  const tours = sanitizeTours(await getHelicopterToursSnapshot());
  const recommendations = tours
    .map((tour) => scoreTour(tour, packet, lane))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.tour.title.localeCompare(b.tour.title);
    })
    .slice(0, Math.min(4, tours.length));

  const telemetryBase = {
    requestedLane,
    resolvedLane: lane.key,
    degradedFallback,
    reason: lane.inventoryNote || undefined,
    port: packet.port || "juneau",
    topic: packet.topic || undefined,
    subtype: packet.subtype || undefined,
    partyType: packet.party || undefined,
    timeWindow: packet.window || undefined,
    budgetBand: packet.budget || undefined,
    sourcePage: packet.sourcePage || packet.source || undefined,
  };

  const telemetryImpressions = recommendations.map((recommendation, index) => ({
    productSlug: `${recommendation.tour.company}/${recommendation.tour.slug || recommendation.tour.pk}`,
    rank: index + 1,
  }));

  return (
    <>
      <PlanTelemetry base={telemetryBase} impressions={telemetryImpressions} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_38%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_46%,#164e63_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Decision Shortlist
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {lane.label} recommendations for your Alaska port day
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/82 sm:text-[15px]">{lane.summary}</p>
            <div className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-50">
              {contextSummary(packet)}
            </div>
            {lane.inventoryNote ? (
              <div className="mt-4 rounded-2xl border border-cyan-200/20 bg-white/10 px-4 py-3 text-sm text-cyan-50">
                {lane.inventoryNote}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Timing First</div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                The return time is the real constraint.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Most excursions feel like they fit until you factor in how long they actually take and when you need to be back.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-700">Plan your excursion in this order</div>
              <div className="mt-4 grid gap-3">
                {[
                  "1. When you need to be back on the ship",
                  "2. How long the experience actually takes",
                  "3. Then which option fits your day",
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-white bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5">
            {recommendations.map((recommendation, index) => {
              const detailHref = `/tours/${recommendation.tour.company}/${recommendation.tour.pk}?from=plan&lane=${lane.key}&requestedLane=${requestedLane}&resolvedLane=${lane.key}&degradedFallback=${degradedFallback ? "true" : "false"}&rank=${index + 1}&sourcePage=/plan&port=${packet.port || "juneau"}&topic=${packet.topic || ""}&subtype=${packet.subtype || ""}`;
              const calendarHref = `/tours/${recommendation.tour.company}/${recommendation.tour.pk}/calendar?from=plan&lane=${lane.key}&requestedLane=${requestedLane}&resolvedLane=${lane.key}&degradedFallback=${degradedFallback ? "true" : "false"}&rank=${index + 1}&sourcePage=/plan&port=${packet.port || "juneau"}&topic=${packet.topic || ""}&subtype=${packet.subtype || ""}`;

              return (
                <article
                  key={`${recommendation.tour.company}-${recommendation.tour.pk}`}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
                        Recommendation {index + 1}
                      </div>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                        {recommendation.tour.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{recommendation.whyFits}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
                      Fit score {recommendation.score}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Tradeoff</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{recommendation.tradeoff}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Duration</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{recommendation.duration}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Effort</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{recommendation.effort}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Best for</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{recommendation.bestFor}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Pricing posture</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{recommendation.pricing}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Availability posture</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{recommendation.availability}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={detailHref}
                      data-plan-click="1"
                      data-product-slug={`${recommendation.tour.company}/${recommendation.tour.slug || recommendation.tour.pk}`}
                      data-rank={index + 1}
                      data-next-step="detail"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white"
                    >
                      Review details
                    </Link>
                    <Link
                      href={calendarHref}
                      data-plan-click="1"
                      data-product-slug={`${recommendation.tour.company}/${recommendation.tour.slug || recommendation.tour.pk}`}
                      data-rank={index + 1}
                      data-next-step="calendar"
                      className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-sky-900"
                    >
                      Check dates
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Packet</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">What this chooser used</h2>
            <dl className="mt-5 grid gap-3 text-sm text-slate-600">
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Port</dt>
                <dd className="mt-1 text-slate-900">{packet.port ? titleCase(packet.port) : "Juneau"}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Topic</dt>
                <dd className="mt-1 text-slate-900">{packet.topic ? titleCase(packet.topic) : "General Alaska tours"}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Subtype</dt>
                <dd className="mt-1 text-slate-900">{packet.subtype ? titleCase(packet.subtype) : "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Party</dt>
                <dd className="mt-1 text-slate-900">{packet.party ? titleCase(packet.party) : "General travelers"}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Window</dt>
                <dd className="mt-1 text-slate-900">{packet.window ? titleCase(packet.window) : "Open timing"}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Mobility</dt>
                <dd className="mt-1 text-slate-900">{packet.mobility ? titleCase(packet.mobility) : "Standard mobility"}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Source</dt>
                <dd className="mt-1 text-slate-900">{packet.source ? packet.source : "Direct"}</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
              This page scores fit and recommends a shortlist. Tour detail, calendar, and checkout should stay focused on acting, not restarting the decision.
            </div>
          </aside>
        </section>
      </div>
      </main>
    </>
  );
}

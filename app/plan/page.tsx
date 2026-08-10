import type { Metadata } from "next";
import Link from "next/link";
import { getHelicopterToursSnapshot, type HelicopterTour } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";

export const metadata: Metadata = {
  title: "Choose Your Best Alaska Shore Excursion | Welcome To Alaska Tours",
  description:
    "Choose Juneau, Skagway, or Ketchikan, tell us what kind of Alaska day you want, and get a four-tour shortlist from connected excursion inventory.",
  alternates: { canonical: "https://welcometoalaskatours.com/plan" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type TripStyle =
  | "best-overall"
  | "wildlife-whales"
  | "glaciers"
  | "flightseeing"
  | "dog-sledding"
  | "fishing"
  | "adventure"
  | "easy-day"
  | "private-premium";

type TourTags = {
  wildlife: boolean;
  glacier: boolean;
  flight: boolean;
  dogSled: boolean;
  fishing: boolean;
  adventure: boolean;
  easy: boolean;
  privatePremium: boolean;
};

type Recommendation = {
  tour: HelicopterTour;
  score: number;
  reason: string;
  tradeoff: string;
  price: number | null;
  duration: string;
  tags: TourTags;
};

const STYLE_COPY: Record<TripStyle, { label: string; summary: string }> = {
  "best-overall": {
    label: "Best overall",
    summary: "A balanced shortlist of strong cruise-day choices in your selected port.",
  },
  "wildlife-whales": {
    label: "Wildlife & whales",
    summary: "Whales, bears, rainforest and wildlife-focused experiences rise to the top.",
  },
  glaciers: {
    label: "Glaciers",
    summary: "Glacier, icefield and Mendenhall-focused experiences rise to the top.",
  },
  flightseeing: {
    label: "Flightseeing",
    summary: "Helicopter, seaplane and aerial sightseeing experiences rise to the top.",
  },
  "dog-sledding": {
    label: "Dog sledding",
    summary: "Husky, sled-dog and glacier-camp experiences rise to the top.",
  },
  fishing: {
    label: "Fishing",
    summary: "Salmon, halibut and fishing-charter experiences rise to the top.",
  },
  adventure: {
    label: "Adventure",
    summary: "Kayaks, canoes, Jeeps, UTVs, ziplines, snorkeling, hiking and active experiences rise to the top.",
  },
  "easy-day": {
    label: "Easy day",
    summary: "Lower-friction sightseeing and simpler-paced options rise to the top. Check individual accessibility details before booking.",
  },
  "private-premium": {
    label: "Private / premium",
    summary: "Private charters and higher-priced splurge experiences rise to the top.",
  },
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

function normalizeStyle(value: string): TripStyle {
  const normalized = normalize(value);
  const allowed: TripStyle[] = [
    "best-overall",
    "wildlife-whales",
    "glaciers",
    "flightseeing",
    "dog-sledding",
    "fishing",
    "adventure",
    "easy-day",
    "private-premium",
  ];
  if (allowed.includes(normalized as TripStyle)) return normalized as TripStyle;
  if (normalized.includes("whale") || normalized.includes("wildlife")) return "wildlife-whales";
  if (normalized.includes("glacier") || normalized.includes("mendenhall")) return "glaciers";
  if (normalized.includes("flight") || normalized.includes("helicopter") || normalized.includes("air")) return "flightseeing";
  if (normalized.includes("dog") || normalized.includes("sled")) return "dog-sledding";
  if (normalized.includes("fish") || normalized.includes("halibut")) return "fishing";
  if (normalized.includes("private") || normalized.includes("premium")) return "private-premium";
  if (normalized.includes("easy") || normalized.includes("mobility")) return "easy-day";
  if (normalized.includes("adventure") || normalized.includes("active")) return "adventure";
  return "best-overall";
}

function parsePrice(text: string | undefined) {
  const match = String(text || "").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseDuration(text: string | undefined) {
  const raw = String(text || "");
  const hour = raw.match(/(\d+(?:\.\d+)?)\s*hours?/i);
  if (hour) return `${hour[1]} hours`;
  const minute = raw.match(/(\d+)\s*minutes?/i);
  if (minute) return `${minute[1]} minutes`;
  return "Check tour details";
}

function inferTags(tour: HelicopterTour): TourTags {
  const text = `${tour.title} ${tour.category || ""} ${tour.description || ""}`.toLowerCase();
  const price = parsePrice(tour.fromPrice || tour.description);

  const wildlife = /whale|bear|wildlife|rainforest|orca|eagle/.test(text);
  const glacier = /glacier|icefield|mendenhall|ice climb/.test(text);
  const flight = /helicopter|flightseeing|seaplane|air tour|airways|flight/.test(text);
  const dogSled = /dog sled|dogsled|sled dog|husky/.test(text);
  const fishing = /fishing|halibut|salmon fishing|fish charter/.test(text);
  const adventure = /kayak|canoe|jeep|utv|zipline|snorkel|trek|hike|scooter|zodiac|paddle|kart/.test(text);
  const easy = /sightseeing|city tour|duck tour|salmon bake|all ages|whale watch|lighthouse|feast/.test(text) && !/trek|hike|climb|zipline|snorkel|utv/.test(text);
  const privatePremium = /private|charter/.test(text) || (price !== null && price >= 700);

  return { wildlife, glacier, flight, dogSled, fishing, adventure, easy, privatePremium };
}

function matchesStyle(tags: TourTags, style: TripStyle) {
  if (style === "best-overall") return true;
  if (style === "wildlife-whales") return tags.wildlife;
  if (style === "glaciers") return tags.glacier;
  if (style === "flightseeing") return tags.flight;
  if (style === "dog-sledding") return tags.dogSled;
  if (style === "fishing") return tags.fishing;
  if (style === "adventure") return tags.adventure;
  if (style === "easy-day") return tags.easy;
  if (style === "private-premium") return tags.privatePremium;
  return true;
}

function reasonForStyle(tags: TourTags, style: TripStyle) {
  if (style === "wildlife-whales") return tags.wildlife ? "Strong wildlife match" : "Closest overall port-day alternative";
  if (style === "glaciers") return tags.glacier ? "Strong glacier match" : "Closest overall port-day alternative";
  if (style === "flightseeing") return tags.flight ? "Strong aerial-scenery match" : "Closest overall port-day alternative";
  if (style === "dog-sledding") return tags.dogSled ? "Strong dog-sledding match" : "Closest overall port-day alternative";
  if (style === "fishing") return tags.fishing ? "Strong fishing match" : "Closest overall port-day alternative";
  if (style === "adventure") return tags.adventure ? "Strong active-adventure match" : "Closest overall port-day alternative";
  if (style === "easy-day") return tags.easy ? "Simpler-paced sightseeing match" : "Closest overall port-day alternative";
  if (style === "private-premium") return tags.privatePremium ? "Strong private/premium match" : "Closest overall port-day alternative";
  return "Strong all-around cruise-day option";
}

function tradeoffForTour(tour: HelicopterTour, tags: TourTags, price: number | null) {
  if (tags.privatePremium) return "Higher spend or private-format commitment; confirm inclusions and cancellation terms.";
  if (tags.adventure) return "More active than a simple sightseeing day; check age, mobility and gear requirements.";
  if (tags.flight) return "Weather can affect flight operations; check the operator calendar and policies.";
  if (tags.fishing) return "Fishing trips can take a larger block of the port day; verify duration and meeting point.";
  if (price !== null && price >= 500) return "Higher-price experience; compare the live calendar and exact rate before checkout.";
  return "Confirm the exact departure time, meeting instructions and ship all-aboard time before booking.";
}

function scoreTour(tour: HelicopterTour, style: TripStyle) {
  const tags = inferTags(tour);
  const price = parsePrice(tour.fromPrice || tour.description);
  let score = 25;

  if (matchesStyle(tags, style)) score += style === "best-overall" ? 8 : 70;
  if (tour.image) score += 5;
  if (price !== null) score += 5;
  if (tags.wildlife) score += 2;
  if (tags.glacier) score += 2;
  if (tags.flight) score += 2;
  if (style === "best-overall" && price !== null && price <= 250) score += 6;
  if (style === "private-premium" && price !== null && price >= 700) score += 15;
  if (style === "easy-day" && tags.adventure) score -= 20;

  return {
    tour,
    score,
    reason: reasonForStyle(tags, style),
    tradeoff: tradeoffForTour(tour, tags, price),
    price,
    duration: parseDuration(tour.description),
    tags,
  } satisfies Recommendation;
}

export default async function PlanPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const port = normalize(readParam(params.port)) || "juneau";
  const style = normalizeStyle(readParam(params.topic) || readParam(params.subtype));
  const ship = readParam(params.cruiseShip).trim();
  const date = readParam(params.date).trim();
  const styleCopy = STYLE_COPY[style];

  const allTours = sanitizeTours(await getHelicopterToursSnapshot()) as HelicopterTour[];
  const portTours = allTours.filter((tour) => tour.port === port);
  const scored = portTours.map((tour) => scoreTour(tour, style)).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aPrice = a.price ?? Number.MAX_SAFE_INTEGER;
    const bPrice = b.price ?? Number.MAX_SAFE_INTEGER;
    if (aPrice !== bPrice) return aPrice - bPrice;
    return a.tour.title.localeCompare(b.tour.title);
  });

  const exact = scored.filter((item) => matchesStyle(item.tags, style));
  const selectedKeys = new Set<string>();
  const recommendations: Recommendation[] = [];

  for (const item of [...exact, ...scored]) {
    const key = `${item.tour.company}:${item.tour.pk}`;
    if (selectedKeys.has(key)) continue;
    selectedKeys.add(key);
    recommendations.push(item);
    if (recommendations.length === 4) break;
  }

  const exactCount = exact.length;
  const portLabel = titleCase(port);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_35%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/#find-your-port-day" className="text-sm font-bold text-sky-800 hover:text-sky-950">← Change my choices</Link>

        <section className="mt-4 overflow-hidden rounded-[2.25rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_52%,#164e63_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">Your 4-tour shortlist</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{styleCopy.label} in {portLabel}</h1>
            <p className="mt-4 text-sm leading-7 text-white/85 sm:text-[15px]">{styleCopy.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/10 px-3 py-2">{portLabel}</span>
              {ship ? <span className="rounded-full bg-white/10 px-3 py-2">{ship}</span> : null}
              {date ? <span className="rounded-full bg-white/10 px-3 py-2">{date}</span> : null}
            </div>
            {style !== "best-overall" && exactCount < 4 ? (
              <div className="mt-5 rounded-2xl border border-cyan-200/20 bg-white/10 px-4 py-3 text-sm text-cyan-50">
                We found {exactCount} direct {styleCopy.label.toLowerCase()} match{exactCount === 1 ? "" : "es"} in this port. The remaining spots are the strongest overall alternatives from the same port.
              </div>
            ) : null}
          </div>
        </section>

        {!recommendations.length ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black">No connected tours found for {portLabel}.</h2>
            <p className="mt-3 text-sm text-slate-600">Browse the full catalog or choose another port while inventory is refreshed.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/tours" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Browse all tours</Link>
              <Link href="/#find-your-port-day" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900">Choose another port</Link>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            {recommendations.map((recommendation, index) => {
              const detailHref = `/tours/${recommendation.tour.company}/${recommendation.tour.pk}?from=plan&rank=${index + 1}&sourcePage=/plan&port=${port}&topic=${style}`;
              const calendarHref = `/tours/${recommendation.tour.company}/${recommendation.tour.pk}/calendar?from=plan&rank=${index + 1}&sourcePage=/plan&port=${port}&topic=${style}${date ? `&date=${encodeURIComponent(date)}` : ""}${ship ? `&cruiseShip=${encodeURIComponent(ship)}` : ""}`;

              return (
                <article key={`${recommendation.tour.company}-${recommendation.tour.pk}`} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img src={recommendation.tour.image || "/images/home-hero.jpg"} alt={recommendation.tour.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">Choice {index + 1} · {recommendation.reason}</div>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{recommendation.tour.title}</h2>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{recommendation.tour.fromPrice || "Check price"}</div>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{recommendation.tour.description || "Open the tour details for operator description, meeting information and booking calendar."}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Timing</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{recommendation.duration}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Know before booking</div>
                        <div className="mt-1 text-xs leading-5 font-semibold text-slate-700">{recommendation.tradeoff}</div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Link href={detailHref} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-900 hover:bg-slate-50">See details</Link>
                      <Link href={calendarHref} className="rounded-xl bg-sky-700 px-4 py-3 text-center text-sm font-black text-white hover:bg-sky-800">Check live calendar →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-6 rounded-[2rem] border border-sky-100 bg-sky-50 p-6 sm:p-7">
          <h2 className="text-xl font-black text-slate-950">The calendar is the final check.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These are shopping recommendations from the connected catalog, not guarantees of availability or ship compatibility. Open the live calendar, confirm the operator meeting instructions, and compare the actual departure with your cruise line&apos;s all-aboard time before booking.</p>
        </section>
      </div>
    </main>
  );
}

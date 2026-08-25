import type { HelicopterTour } from "@/lib/helicopterTours";
import { buildRecommendationShortlist } from "@/lib/recommendationEngine";

export type TripStyle =
  | "best-overall"
  | "wildlife-whales"
  | "glaciers"
  | "flightseeing"
  | "dog-sledding"
  | "fishing"
  | "adventure"
  | "easy-day"
  | "private-premium";

export type TourTags = {
  wildlife: boolean;
  glacier: boolean;
  flight: boolean;
  dogSled: boolean;
  fishing: boolean;
  adventure: boolean;
  easy: boolean;
  privatePremium: boolean;
};

export type AlaskaRecommendation = {
  tour: HelicopterTour;
  score: number;
  reason: string;
  tradeoff: string;
  price: number | null;
  duration: string;
  tags: TourTags;
  exactMatch: boolean;
};

export const STYLE_COPY: Record<TripStyle, { label: string; summary: string }> = {
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

function normalize(value: string | undefined) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeTripStyle(value: string): TripStyle {
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

export function parseTourPrice(text: string | undefined) {
  const match = String(text || "").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function parseTourDuration(text: string | undefined) {
  const raw = String(text || "");
  const hour = raw.match(/(\d+(?:\.\d+)?)\s*hours?/i);
  if (hour) return `${hour[1]} hours`;
  const minute = raw.match(/(\d+)\s*minutes?/i);
  if (minute) return `${minute[1]} minutes`;
  return "Check tour details";
}

export function inferAlaskaTourTags(tour: HelicopterTour): TourTags {
  const text = `${tour.title} ${tour.category || ""} ${tour.description || ""}`.toLowerCase();
  const price = parseTourPrice(tour.fromPrice || tour.description);

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

export function matchesTripStyle(tags: TourTags, style: TripStyle) {
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

function tradeoffForTour(tags: TourTags, price: number | null) {
  if (tags.privatePremium) return "Higher spend or private-format commitment; confirm inclusions and cancellation terms.";
  if (tags.adventure) return "More active than a simple sightseeing day; check age, mobility and gear requirements.";
  if (tags.flight) return "Weather can affect flight operations; check the operator calendar and policies.";
  if (tags.fishing) return "Fishing trips can take a larger block of the port day; verify duration and meeting point.";
  if (price !== null && price >= 500) return "Higher-price experience; compare the live calendar and exact rate before checkout.";
  return "Confirm the exact departure time, meeting instructions and ship all-aboard time before booking.";
}

function evaluateTour(tour: HelicopterTour, style: TripStyle) {
  const tags = inferAlaskaTourTags(tour);
  const price = parseTourPrice(tour.fromPrice || tour.description);
  const exactMatch = matchesTripStyle(tags, style);
  let score = 25;

  if (exactMatch) score += style === "best-overall" ? 8 : 70;
  if (tour.image) score += 5;
  if (price !== null) score += 5;
  if (tags.wildlife) score += 2;
  if (tags.glacier) score += 2;
  if (tags.flight) score += 2;
  if (style === "best-overall" && price !== null && price <= 250) score += 6;
  if (style === "private-premium" && price !== null && price >= 700) score += 15;
  if (style === "easy-day" && tags.adventure) score -= 20;

  return {
    key: `${tour.company}:${tour.pk}`,
    score,
    exactMatch,
    reason: reasonForStyle(tags, style),
    tradeoff: tradeoffForTour(tags, price),
    meta: {
      price,
      duration: parseTourDuration(tour.description),
      tags,
    },
  };
}

export function buildAlaskaTourShortlist(
  tours: readonly HelicopterTour[],
  style: TripStyle,
  limit = 4
) {
  const shortlist = buildRecommendationShortlist({
    candidates: tours,
    limit,
    evaluate: (tour) => evaluateTour(tour, style),
    tieBreak: (a, b) => {
      const aPrice = a.meta?.price ?? Number.MAX_SAFE_INTEGER;
      const bPrice = b.meta?.price ?? Number.MAX_SAFE_INTEGER;
      if (aPrice !== bPrice) return aPrice - bPrice;
      return a.candidate.title.localeCompare(b.candidate.title);
    },
  });

  const recommendations: AlaskaRecommendation[] = shortlist.recommendations.map((item) => ({
    tour: item.candidate,
    score: item.score,
    reason: item.reason,
    tradeoff: item.tradeoff || "",
    price: item.meta?.price ?? null,
    duration: item.meta?.duration || "Check tour details",
    tags: item.meta?.tags || inferAlaskaTourTags(item.candidate),
    exactMatch: item.exactMatch,
  }));

  return {
    recommendations,
    exactCount: shortlist.exactCount,
  };
}

import FAQSection from "@/app/components/faq/FAQSection";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import HandoffTracker from "@/app/components/tours/HandoffTracker";
import TourViewTracker from "@/app/components/analytics/TourViewTracker";
import { getHelicopterTour } from "@/lib/helicopterTours";
import { CRUISE_ITINERARY_HINTS, type CruiseShipName } from "@/lib/cruiseShips";
import { parseTimeToMinutes, formatMinutesToTime } from "@/lib/timing";
import {
  buildTourBreadcrumbSchema,
  buildTourUrl,
  cleanTourDescription,
  sanitizeTour,
} from "@/lib/tourSeo";
import { notFound } from "next/navigation";
import StageTelemetry from "@/app/components/plan/StageTelemetry";
import Link from "next/link";
import Image from "next/image";
import { getOperatorCancellationPolicy } from "@/lib/operatorCancellationPolicies";

const isGenericDescription = (desc: string) => {
  const d = desc.toLowerCase();
  return d.includes("cruise-friendly") || d.includes("memorable day in port") || d.includes("without wasting time");
};

function getOperatorDisplayName(company: string): string {
  const mapping: Record<string, string> = {
    beyondak: "Beyond Alaska",
    "alaska-galore-juneau-whale-watching": "Alaska Galore Juneau Whale Watching",
    akhummer: "Alaska Hummer",
    alaskatales: "Alaska Tales",
    aktraveladventures: "Alaska Travel Adventures",
    exclusivealaska: "Exclusive Alaska",
    coastalhelicopters: "Coastal Helicopters",
    dolphintours: "Dolphin Tours",
    moorecharters: "Moore Charters",
    alaskarainforest: "Alaska Rainforest",
    ketchikanadventurevue: "Ketchikan AdventureVue",
    akduck: "Alaska Duck",
    northstartrekking: "Northstar Trekking",
    kayakketchikan: "Kayak Ketchikan",
    skagwayscooters: "Skagway Scooters",
    snorkelalaska: "Snorkel Alaska",
    taquanair: "Taquan Air",
    "temsco-summercamp-juneau": "TEMSCO Helicopter Summer Camp",
    "temscoair-juneau": "TEMSCO Helicopters (Juneau)",
    "temscoair-skagway": "TEMSCO Helicopters (Skagway)",
    wingsairways: "Wings Airways",
  };
  return mapping[company.toLowerCase().trim()] || company.replace(/-/g, " ");
}

function parseTourDescriptionDetails(
  title: string,
  description?: string | null,
  company?: string,
  pk?: string | number,
) {
  const desc = String(description || "");
  const lower = (title + " " + desc).toLowerCase();
  const compLower = String(company || "").toLowerCase();
  const isTemsco = compLower.startsWith("temsco");
  const isNorthStar405050 =
    (compLower === "northstartrekking" && (String(pk) === "405050" || lower.includes("northstar"))) ||
    String(pk) === "405050";

  // 1. Duration
  let duration = "";
  const compoundMatch = desc.match(/\b(\d+)\s*Hours?(?:\s*(?:&|and|,)\s*|\s+)(\d+)\s*Minutes?\b/i);
  if (compoundMatch) {
    duration = `${compoundMatch[1]} Hours ${compoundMatch[2]} Minutes`;
  } else {
    const fractionMatch = desc.match(/\b(\d+)\s*([¼½¾]|1\/4|1\/2|3\/4)\s*Hours?\b/i);
    if (fractionMatch) {
      const frac = fractionMatch[2];
      const mins = (frac === "¼" || frac === "1/4") ? "15 Minutes" : (frac === "½" || frac === "1/2") ? "30 Minutes" : "45 Minutes";
      duration = `${fractionMatch[1]} Hours ${mins}`;
    } else {
      const durationMatch = desc.match(/\b(\d+(?:\.\d+)?)\s*Hours?\b/i);
      if (durationMatch) {
        const val = parseFloat(durationMatch[1]);
        if (val === 2.25) {
          duration = "2 Hours 15 Minutes";
        } else if (val === 2.5) {
          duration = "2 Hours 30 Minutes";
        } else if (val === 2.75) {
          duration = "2 Hours 45 Minutes";
        } else if (val === 3.5) {
          duration = "3 Hours 30 Minutes";
        } else {
          duration = `${durationMatch[1]} Hours`;
        }
      }
    }
  }

  if (isNorthStar405050) {
    duration = "2 Hours 15 Minutes";
  }

  // 2. Activity Level / Difficulty
  let activityLevel = "";
  const difficultyMatch =
    desc.match(/Difficulty:\s*([^|]+)/i) ||
    desc.match(/Difficulty\s*([^|]+)/i) ||
    desc.match(/Activity Level:\s*([^|]+)/i);
  if (difficultyMatch) {
    activityLevel = difficultyMatch[1].trim();
  } else {
    if (lower.includes("strenuous") || lower.includes("trek") || lower.includes("active") || lower.includes("hike")) {
      activityLevel = "Moderate to Strenuous";
    } else if (lower.includes("easy") || lower.includes("light") || lower.includes("flightseeing")) {
      activityLevel = "Easy";
    } else {
      activityLevel = "Easy to Moderate";
    }
  }

  // 3. Age Constraints
  let ageConstraint = "";
  const ageMatch =
    desc.match(/passenger ages?\s*(\d+)\+/i) ||
    desc.match(/ages?\s*(\d+)\+/i) ||
    desc.match(/minimum age\s*(?:of|is)?\s*(\d+)/i) ||
    desc.match(/\b(\d+)\+/);
  if (ageMatch) {
    ageConstraint = `Ages ${ageMatch[1]}+`;
  } else if (isNorthStar405050) {
    ageConstraint = "Ages 7+";
  }

  // 4. Seasonality
  let seasonality = "May – September";
  if (isNorthStar405050 || lower.includes("month of september") || lower.includes("september only")) {
    seasonality = "September Only";
  }

  // 5. Weight Policy
  let weightPolicy = "";
  if (isNorthStar405050) {
    weightPolicy = "250+ lbs: $150 NorthStar surcharge";
  } else if (isTemsco) {
    weightPolicy = "250+ lbs (w/ gear): +$150 TEMSCO surcharge";
  } else if (lower.includes("helicopter") || lower.includes("flight")) {
    weightPolicy = "Standard passenger weight check";
  }

  return { duration, activityLevel, ageConstraint, seasonality, weightPolicy, isNorthStar405050, isTemsco };
}

function parseDurationMinutes(durationStr: string): number {
  if (!durationStr) return 0;
  const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*Hours?/i);
  const minsMatch = durationStr.match(/(\d+)\s*Minutes?/i);
  let total = 0;
  if (hoursMatch) {
    total += parseFloat(hoursMatch[1]) * 60;
  }
  if (minsMatch) {
    total += parseInt(minsMatch[1], 10);
  }
  return Math.round(total);
}

function getCruiseFitSubtitle(isHeliOrAir: boolean, isBoat: boolean, portName: string) {
  if (isHeliOrAir) {
    return `Helicopter flights and glacial excursions in ${portName} require tight alignment with flight clearances and your port timeline. Evaluate the metrics below before final booking.`;
  }
  if (isBoat) {
    return `Catamaran, whale watching, and marine excursions in ${portName} depart from local harbors on fixed schedules. Evaluate the metrics below to ensure a smooth return before your ship's all-aboard.`;
  }
  return `Shore excursions in ${portName} require alignment with your cruise ship's arrival and all-aboard schedule. Evaluate the metrics below before final booking.`;
}

function getTimingBufferNote(isHeliOrAir: boolean, isBoat: boolean) {
  if (isHeliOrAir) {
    return "Mountain weather cancellations or delays can happen due to high-altitude cloud cover or visibility checks. Always schedule flights earlier in your port day to ensure proper safety room.";
  }
  if (isBoat) {
    return "Marine wildlife excursions navigate sheltered coastal passages and operate rain or shine. Booking earlier in your port stay provides the most relaxed cushion before your ship's all-aboard.";
  }
  return "Local excursions operate rain or shine across Southeast Alaska. We recommend scheduling departures with sufficient buffer before your ship's scheduled all-aboard time.";
}

function getCheckInMappingText(isHeliOrAir: boolean, isBoat: boolean, portName: string, company?: string) {
  if (company?.toLowerCase().startsWith("temsco") && portName.toLowerCase() === "skagway") {
    return "Check in directly at TEMSCO's Skagway heliport base (101 Terminal Way, adjacent to the ferry terminal and walkable from Broadway/Ore cruise docks) 30 minutes prior to departure. Complimentary return transfer back to downtown Skagway and cruise berths is provided following the tour.";
  }
  if (isHeliOrAir) {
    return `Departures include round-trip shuttle service from downtown ${portName} cruise terminal staging points directly to the heliport. Complete pickup coordinates, vehicle signage, and departure times are emailed directly upon checkout confirmation.`;
  }
  if (isBoat) {
    return `Tours stage from designated cruise berth loading zones or harbor docks in ${portName}. Round-trip pier transfers or walking directions from your specific ship dock are emailed directly upon checkout confirmation.`;
  }
  return `Departures meet near downtown ${portName} cruise docks or designated port pickup points. Detailed meeting instructions, staging maps, and local dispatch contacts are emailed directly upon checkout confirmation.`;
}

function getCancellationPolicyText(company: string, pk?: number | string, livePolicy?: string) {
  return getOperatorCancellationPolicy(company, pk, livePolicy).overviewCardText;
}

function getWhoItIsBestFor(title: string, category: string, company?: string, pk?: string | number) {
  const text = (title + " " + category).toLowerCase();
  if (company?.toLowerCase().startsWith("temsco") && String(pk) === "213561") {
    return "Best for travelers seeking an alpine helicopter flight, authentic sled dog mushing demonstration, and husky puppy interaction (note: guests observe the demonstration rather than riding the sled).";
  }
  if (text.includes("helicopter") || text.includes("flight") || text.includes("air")) {
    return "Best for travelers seeking once-in-a-lifetime glacier views and flightseeing.";
  }
  if (text.includes("dog") || text.includes("husky") || text.includes("sled")) {
    return "Best for active families and travelers wanting a mushing dog sled experience.";
  }
  if (text.includes("whale") || text.includes("marine") || text.includes("boat")) {
    return "Best for wildlife enthusiasts and families looking for marine humpback views.";
  }
  if (text.includes("hike") || text.includes("trek") || text.includes("glacier")) {
    return "Best for active travelers who want to hike or trek on ice fields.";
  }
  return "Best for cruise travelers seeking a premium port excursion.";
}

function getWhoShouldSkip(title: string, activityLevel: string, ageConstraint: string) {
  const skip = [];
  const text = (title + " " + activityLevel).toLowerCase();
  if (text.includes("helicopter") || text.includes("flight") || text.includes("air")) {
    skip.push("Not recommended for guests with a severe fear of heights.");
  }
  if (activityLevel.toLowerCase().includes("strenuous") || activityLevel.toLowerCase().includes("moderate")) {
    skip.push("Not recommended for travelers with severe mobility limitations or joint concerns.");
  }
  if (ageConstraint) {
    skip.push(`Not suitable for children under the minimum age requirement (${ageConstraint}).`);
  }
  if (skip.length === 0) {
    skip.push("Not recommended if you have less than 4 hours in port.");
  }
  return skip.join(" ");
}

function getCategoryLink(categoryName: string, title: string) {
  const text = (title + " " + categoryName).toLowerCase();
  if (text.includes("helicopter") || text.includes("flight") || text.includes("air")) {
    return { href: "/categories/juneau-helicopter-tours", label: "Helicopter Tours" };
  }
  if (text.includes("dog") || text.includes("husky") || text.includes("sled")) {
    return { href: "/categories/dog-sledding", label: "Dog Sledding" };
  }
  if (text.includes("whale") || text.includes("marine") || text.includes("boat")) {
    return { href: "/categories/whale-watching", label: "Whale Watching" };
  }
  if (text.includes("hike") || text.includes("trek") || text.includes("glacier")) {
    return { href: "/categories/glacier-tours", label: "Glacier Hikes" };
  }
  return { href: "/categories/mendenhall-glacier", label: "Mendenhall Glacier" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string; item: string }>;
}) {
  const { company, item } = await params;
  const tour = await getHelicopterTour(company, item);
  if (!tour) return {};

  const safeTour = sanitizeTour(tour);
  const operatorName = getOperatorDisplayName(safeTour.company);
  const title = `${safeTour.title} | ${operatorName} Excursion`;
  
  let description = cleanTourDescription(safeTour.description, "Alaska excursion.");
  const isTemsco556Meta = safeTour.company === "temscoair-skagway" && (String(safeTour.pk || item) === "213556" || Number(safeTour.pk || item) === 213556);
  const isTemsco561Meta = safeTour.company === "temscoair-skagway" && (String(safeTour.pk || item) === "213561" || Number(safeTour.pk || item) === 213561);
  if (isTemsco556Meta) {
    description = "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk";
  } else if (isTemsco561Meta) {
    description = "$599 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Dog Sledding Demonstration (No Sled Riding)";
  } else if (isGenericDescription(description)) {
    description = `Book the ${safeTour.title} operated by ${operatorName}. Verify cruise schedule fit and check real-time availability.`;
  }
  description = description.replace(/^Starting at\s+/i, "");

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.welcometoalaskatours.com/tours/${company}/${item}`,
    },
    openGraph: {
      title,
      description,
      images: safeTour.image ? [{ url: safeTour.image }] : [],
    },
  };
}

export default async function TourDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ company: string; item: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { company, item } = await params;
  const sp = await searchParams;
  const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? String(value[0] || "") : String(value || "");
  const tour = await getHelicopterTour(company, item);

  if (!tour) {
    notFound();
  }

  const safeTour = sanitizeTour(tour);
  const operatorName = getOperatorDisplayName(safeTour.company);
  const portName = safeTour.port ? safeTour.port.charAt(0).toUpperCase() + safeTour.port.slice(1) : "Juneau";
  const categoryName = safeTour.category || "Shore Excursion";
  const { duration, activityLevel, ageConstraint, seasonality, weightPolicy, isNorthStar405050, isTemsco } = parseTourDescriptionDetails(
    safeTour.title,
    safeTour.description,
    safeTour.company,
    safeTour.pk || item,
  );
  const isTemsco556 = safeTour.company === "temscoair-skagway" && (String(safeTour.pk || item) === "213556" || Number(safeTour.pk || item) === 213556);
  const isTemsco561 = safeTour.company === "temscoair-skagway" && (String(safeTour.pk || item) === "213561" || Number(safeTour.pk || item) === 213561);
  if (isNorthStar405050) {
    safeTour.fromPrice = "$419 Per Person (Flat Rate)";
  } else if (isTemsco556) {
    safeTour.fromPrice = "$439 Per Person (Flat Rate)";
  } else if (isTemsco561) {
    safeTour.fromPrice = "$599 Per Person (Flat Rate)";
  }
  const cancellationPolicyInfo = getOperatorCancellationPolicy(
    safeTour.company,
    safeTour.pk || item,
    safeTour.cancellationPolicy,
  );
  const bestForText = getWhoItIsBestFor(safeTour.title, categoryName, safeTour.company, safeTour.pk || item);
  const skipText = getWhoShouldSkip(safeTour.title, activityLevel, ageConstraint);

  const hasRealOperatorImage = Boolean(safeTour.image && String(safeTour.image).trim());
  const fallbackHero = safeTour.port === "ketchikan" ? "/hero/ketchikan.png" : safeTour.port === "skagway" ? "/hero/skagway.jpg" : "/hero/juneau.jpg";
  const heroSrc = hasRealOperatorImage ? safeTour.image! : fallbackHero;
  let description = cleanTourDescription(safeTour.description, "Alaska excursion.");
  if (isTemsco556) {
    description = "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk";
  } else if (isTemsco561) {
    description = "$599 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Dog Sledding Demonstration (No Sled Riding)";
  } else if (isGenericDescription(description)) {
    description = "Experience a premier excursion during your port day in Alaska. Review live departures and availability below to secure your booking.";
  }
  description = description.replace(/^Starting at\s+/i, "");

  const hasNextAvailability = Boolean(safeTour.nextAvailableDate);
  const categoryLink = getCategoryLink(categoryName, safeTour.title);

  // Cruise Timing calculation
  const cruiseShip = getParam(sp.cruiseShip);
  let shipArrival: string | undefined = undefined;
  let shipDeparture: string | undefined = undefined;
  let shipWindow: string | undefined = undefined;

  if (cruiseShip && CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName]) {
    const hint = CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName]!;
    if (hint.portSlug === safeTour.port) {
      const windowMatch = hint.window.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
      if (windowMatch) {
        shipArrival = windowMatch[1];
        shipDeparture = windowMatch[2];
        shipWindow = hint.window;
      }
    }
  }

  const isHeliOrAir = /helicopter|flight|air|seaplane|floatplane/i.test(safeTour.title);
  const isBoat = /whale|boat|catamaran|marine|fishing|charter|cruise|water/i.test(safeTour.title);
  const isKartOrScooter = /kart|scooter|utv|atv|jeep/i.test(safeTour.title);
  const isPrivate = /private|charter/i.test(safeTour.title) || (safeTour.fromPrice && safeTour.fromPrice.toLowerCase().includes("private"));

  let timingStatus: "safe" | "tight" | "unsafe" | "unknown" = "unknown";
  let timingGuidanceText = "";
  let bufferMinutes = isHeliOrAir ? 60 : 45;

  if (shipArrival && shipDeparture && duration) {
    const durationMinutes = parseDurationMinutes(duration);

    if (durationMinutes > 0) {
      const arrMin = parseTimeToMinutes(shipArrival);
      const depMin = parseTimeToMinutes(shipDeparture);
      if (arrMin !== null && depMin !== null) {
        const allAboardMin = depMin - 30;
        const earliestSafeStart = arrMin + 45;
        const latestSafeStart = allAboardMin - durationMinutes - bufferMinutes;

        if (latestSafeStart >= earliestSafeStart) {
          timingStatus = "safe";
          timingGuidanceText = `This excursion fits your port window. For the ${cruiseShip} (${shipWindow}), departures for this ${duration} tour starting between ${formatMinutesToTime(earliestSafeStart)} and ${formatMinutesToTime(latestSafeStart)} leave the recommended ${bufferMinutes}-minute safety buffer.`;
        } else if (allAboardMin - arrMin >= durationMinutes) {
          timingStatus = "tight";
          timingGuidanceText = `Timing may be tight. A ${duration} tour will consume most of your ship's port day window (${shipWindow}). Confirm your ship's exact all-aboard time before booking.`;
        } else {
          timingStatus = "unsafe";
          timingGuidanceText = `This tour is not recommended. At ${duration}, it exceeds or does not safely fit your ship's port day window (${shipWindow}) with the recommended safety buffers.`;
        }
      }
    }
  }

  if (timingStatus === "unknown") {
    if (cruiseShip) {
      timingGuidanceText = `Enter or confirm your ship timing for the ${cruiseShip} to check compatibility. Ensure your excursion fits with a ${bufferMinutes}-minute return buffer before all-aboard time.`;
    } else {
      timingGuidanceText = `Enter your cruise ship details to check timing compatibility. We recommend leaving a return buffer of at least ${bufferMinutes} minutes before your ship's all-aboard time.`;
    }
  }

  const timingConfig = {
    safe: {
      border: "border-emerald-250 bg-emerald-50 text-emerald-950",
      title: "✅ Safe Return Window Verified",
    },
    tight: {
      border: "border-amber-250 bg-amber-50 text-amber-955",
      title: "⚠️ Tight Departure Sync Window",
    },
    unsafe: {
      border: "border-rose-250 bg-rose-50 text-rose-955",
      title: "❌ Timing Not Recommended",
    },
    unknown: {
      border: "border-slate-200 bg-slate-50 text-slate-800",
      title: "ℹ️ Confirm Cruise Day Timing",
    },
  }[timingStatus];

  // Telemetry
  const telemetryPayload = {
    event: "detail_view" as const,
    path: `/tours/${company}/${item}`,
    requestedLane: getParam(sp.requestedLane) || undefined,
    resolvedLane: getParam(sp.resolvedLane) || getParam(sp.lane) || undefined,
    degradedFallback: getParam(sp.degradedFallback) === "true" ? true : getParam(sp.degradedFallback) === "false" ? false : undefined,
    productSlug: `${safeTour.company}/${safeTour.slug || safeTour.pk}`,
    rank: getParam(sp.rank) ? Number(getParam(sp.rank)) : undefined,
    port: safeTour.port || undefined,
    topic: getParam(sp.topic) || undefined,
    subtype: getParam(sp.subtype) || undefined,
    sourcePage: getParam(sp.sourcePage) || getParam(sp.from) || undefined,
  };

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string" && value) qs.set(key, value);
  }
  if (!qs.get("port")) qs.set("port", safeTour.port);
  if (!qs.get("productSlug")) qs.set("productSlug", safeTour.slug);

  let bookingPageHref = `/tours/${safeTour.company}/${safeTour.pk}/calendar?${qs.toString()}`;
  if (safeTour.nextAvailableDate) {
    const d = new Date(safeTour.nextAvailableDate);
    if (!Number.isNaN(d.getTime())) {
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      qs.set("month", month);
      bookingPageHref = `/tours/${safeTour.company}/${safeTour.pk}/calendar?${qs.toString()}`;
    }
  }

  // Schema generation
  const seoData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": safeTour.title || "Alaska Excursion",
    "description": description,
    "image": heroSrc,
    "url": buildTourUrl(safeTour),
    "provider": {
      "@type": "Organization",
      "name": "Welcome To Alaska Tours",
    },
  };
  
  const breadcrumbSchema = buildTourBreadcrumbSchema(safeTour);

  const priceMatch = (safeTour.fromPrice || "").match(/\d+/);
  const numericPrice = isNorthStar405050
    ? "419"
    : safeTour.company === "temscoair-skagway" && String(safeTour.pk || item) === "213556"
    ? "439"
    : safeTour.company === "temscoair-skagway" && String(safeTour.pk || item) === "213561"
    ? "599"
    : priceMatch
    ? priceMatch[0]
    : null;
  const productSchema = numericPrice ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": safeTour.title,
    "image": heroSrc,
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": `${numericPrice}.00`,
      "priceCurrency": "USD",
      "availability": hasNextAvailability ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      "url": buildTourUrl(safeTour),
    }
  } : null;

  const renderedFaqs = [
    {
      question: `Does this departure fit my cruise ship's port window in ${portName}?`,
      answer: `Excursion timing compatibility depends directly on your ship's arrival and all-aboard times. We recommend a minimum ${isHeliOrAir ? "60-minute" : "45-minute"} return safety buffer between the tour return and your ship's scheduled all-aboard time. Always confirm your ship's exact port hours before booking.`,
    },
    {
      question: `Where do we meet in ${portName}, and what if my ship docks at an outer berth?`,
      answer:
        safeTour.port === "juneau"
          ? "Departures stage near the Mt. Roberts Tramway parking lot (490 S Franklin St), an easy 5-minute flat walk from downtown docks (Franklin, CT, and IVF berths). If your ship docks at the south AJ Dock, take the $5 port shuttle directly to the tram lot for your tour check-in."
          : safeTour.port === "ketchikan"
          ? "Tours meet along the downtown Ketchikan waterfront right near Berths 1, 2, and 3. If your ship berths at Ward Cove (Berth 4, 7 miles north), allow 15 to 20 minutes to ride the port shuttle to the downtown meeting point before tour check-in."
          : isTemsco && safeTour.port === "skagway"
          ? "Guests check in directly at the TEMSCO Skagway heliport base (101 Terminal Way, adjacent to the ferry terminal and walkable from Broadway/Ore cruise docks) 30 minutes prior to departure. Complimentary return transportation back to downtown Skagway and cruise docks is provided after your tour."
          : "Departures stage in downtown Skagway along 2nd Avenue or at the Small Boat Harbor, a level 5 to 10-minute walk from the Railroad Dock, Broadway Dock, and Ore Dock.",
    },
    ...(isTemsco561 ? [{
      question: "Do guests get to ride on the dog sled during this Skagway helicopter tour?",
      answer: "No. TEMSCO Air explicitly confirms that guests cannot ride the sled on this excursion. The tour is an aerial flightseeing experience, alpine snow landing, kennel visit, and active dog sledding demonstration where you observe the dog team running and interact directly with the dogs and puppies.",
    }] : []),
    {
      question: "How much walking, climbing, or boarding assistance is involved?",
      answer:
        isHeliOrAir
          ? "Moderate mobility is required. Guests must climb 2–3 steep steps into the aircraft with staff assistance. Glacier landings involve walking 200–400 yards over natural ice; sturdy overboots or crampons are fitted on site."
          : isBoat
          ? "Low physical exertion. Boarding is via dock gangway ramps. Enclosed heated cabins feature comfortable seating and wide outdoor viewing decks. Folding wheelchairs can be stowed on board."
          : isKartOrScooter
          ? "Active physical participation. Operators must hold a valid driver's license. Riding involves vibration and sitting upright over off-road or gravel surfaces. Full protective helmets are supplied."
          : "Standard walking at an easy to moderate pace. Any necessary equipment, safety gear, or walking sticks are provided by the operator.",
    },
    {
      question: isHeliOrAir ? "What age, weight, or passenger restrictions apply?" : "What age, physical, or equipment requirements apply?",
      answer:
        isHeliOrAir
          ? `Aircraft weight and balance calculations are required for all flights. ${isNorthStar405050 ? "NorthStar charges an additional $150 operator weight surcharge for passengers weighing 250 lbs (113 kg) or more to reserve adequate aircraft space. Minimum age: Ages 7+." : isTemsco ? "TEMSCO charges an additional $150 operator weight surcharge for passengers weighing 250 lbs or more (calculated including all clothing and footwear). Children of all ages are welcome." : "Guests weighing 250 lbs or more may require an adjacent seat or weight surcharge in accordance with operator guidelines. " + (ageConstraint ? `Age policy: ${ageConstraint}.` : "Children of all ages are welcome.")}`
          : `${ageConstraint ? `Age policy: ${ageConstraint}.` : "All ages are welcome."} Dress in warm layers with a waterproof outer jacket and flat, comfortable walking shoes. Specialized gear (neoprene overboots, spray skirts, or flotation suits) is furnished by ${operatorName}.`,
    },
    {
      question: `What happens if weather cancels the tour or my ship misses port?`,
      answer: cancellationPolicyInfo.faqAnswer,
    },
    {
      question: "Is the listed price per person or for the entire group, and what is included?",
      answer: isPrivate
        ? "This is a private charter flat rate. The price covers your entire private party up to the vessel or vehicle's maximum licensed capacity, with dedicated exclusive guide and captain service."
        : `The price (${safeTour.fromPrice || "listed rate"}) is a verified flat rate per person (or per adult where age tiers apply). It includes all required local port staging, certified guide service, and gear. Taxes are transparently itemized with zero surprise booking fees at checkout.${isNorthStar405050 ? " Note: NorthStar applies a $150 weight surcharge for passengers 250+ lbs." : isTemsco ? " Note: TEMSCO applies a $150 weight surcharge for passengers 250+ lbs (calculated including clothing and footwear)." : ""}`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": renderedFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <>
      <StageTelemetry payload={telemetryPayload} enabled={Boolean(getParam(sp.from) === "plan" || getParam(sp.requestedLane))} />
      <HandoffTracker port={safeTour.port} slug={safeTour.slug} />
      <TourViewTracker
        tour={{
          company: safeTour.company,
          itemPk: safeTour.pk || item,
          title: safeTour.title,
          category: categoryName,
          fromPrice: safeTour.fromPrice,
          port: safeTour.port,
        }}
      />
      <JsonLd data={seoData} />
      <JsonLd data={breadcrumbSchema} />
      {productSchema && <JsonLd data={productSchema} />}
      <JsonLd data={faqSchema} />
      
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 text-slate-900 bg-white space-y-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/tours", label: "Tours" },
            { href: `/ports/${safeTour.port}`, label: portName },
            { label: safeTour.title },
          ]}
        />

        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          <div className="space-y-4">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={categoryLink.href}
                className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-850 hover:bg-sky-200 transition"
              >
                {categoryLink.label}
              </Link>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{portName}</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-tight">
              {safeTour.title}
            </h1>
            
            <p className="text-sm font-medium text-slate-500">
              Operated by <strong className="text-slate-800">{operatorName}</strong> in {portName}, Alaska
            </p>

            {/* Mobile-only CTA and Price right below the operator */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 lg:hidden space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Tour Price (Flat Rate)</span>
                  <span className="text-xl font-black text-slate-900">{safeTour.fromPrice || "Check Price"}</span>
                  {isTemsco && (
                    <span className="text-[10px] text-slate-500 block">250+ lbs: +$150 weight surcharge</span>
                  )}
                  {isNorthStar405050 && (
                    <span className="text-[10px] text-slate-500 block">250+ lbs: +$150 surcharge</span>
                  )}
                </div>
                <Link
                  href={isNorthStar405050 ? `/tours/${company}/${item}/calendar` : bookingPageHref}
                  className="flex-1 max-w-[200px] rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition uppercase tracking-wider"
                >
                  {isNorthStar405050 ? "Check Departures" : "Book Now"}
                </Link>
              </div>
              {isTemsco561 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-medium text-amber-950">
                  ⚠️ <strong>No Sled Riding:</strong> Guests observe an active dog sledding demonstration on snow and cuddle puppies. <strong>Guests cannot ride the sled on this excursion.</strong>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                <span>🛡️ {cancellationPolicyInfo.shortTerms.split(".")[0]}.</span>
                <span>⚡ Instant voucher</span>
              </div>
            </div>

            {/* Main Hero Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-stone-200 shadow-md">
              <Image
                src={heroSrc}
                alt={`${safeTour.title} - ${operatorName} (${portName}, Alaska)`}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-w-7xl) 100vw, 1200px"
              />
              {!hasRealOperatorImage && (
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/75 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  📍 Regional preview shown · Verified operator itinerary below
                </div>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {safeTour.imageGallery && safeTour.imageGallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {safeTour.imageGallery.map((imgUrl, i) => (
                  <div key={i} className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={imgUrl}
                      alt={`${safeTour.title} gallery thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Hero Side Panel */}
          <div className="self-start lg:sticky lg:top-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tour Price (Flat Rate)</span>
              <div className="mt-1 text-2xl font-black text-slate-900 leading-tight">
                {safeTour.fromPrice || "Check Price"}
              </div>
              {isNorthStar405050 && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Ages 7+ • Passengers 250+ lbs: +$150 NorthStar surcharge
                </p>
              )}
              {isTemsco && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Passengers 250+ lbs (fully clothed with footwear): +$150 TEMSCO weight surcharge
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Live Status</span>
              <span className="mt-1 font-bold text-slate-900 block text-xs">
                {hasNextAvailability
                  ? `Next available: ${safeTour.nextAvailableDate}`
                  : isNorthStar405050
                  ? "September Only (Check calendar for dates)"
                  : "Check calendar for departures"}
              </span>
            </div>

            {isNorthStar405050 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-800">
                  <span>🗓️</span>
                  <span>Seasonal Schedule Notice</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  NorthStar operates this tour <strong>exclusively during the month of September</strong>. No departures are currently available for online booking for these dates.
                </p>
                <div className="pt-1 flex flex-col gap-1.5 text-[11px]">
                  <Link
                    href={`/tours/${company}/${item}/calendar`}
                    className="font-semibold text-sky-800 underline hover:text-sky-950"
                  >
                    Check Tour Calendar &rarr;
                  </Link>
                  <Link
                    href="/juneau/helicopter-tours"
                    className="font-semibold text-sky-800 underline hover:text-sky-950"
                  >
                    Browse May–August Helicopter Tours &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Timing Safeguard Warning */}
            <div className={`rounded-2xl border p-4 ${timingConfig.border}`}>
              <h3 className="text-xs font-black uppercase tracking-wider">{timingConfig.title}</h3>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                {timingGuidanceText}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="grid gap-3 pt-2">
              {isTemsco561 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-900">
                    <span>⚠️</span>
                    <span>Demonstration Excursion (No Sled Riding)</span>
                  </div>
                  <p className="leading-relaxed text-slate-800">
                    Guests fly to Denver Glacier to observe an active dog sledding demonstration on snow, meet veteran mushers, and cuddle husky puppies. <strong>TEMSCO explicitly notes that guests cannot ride the sled on this tour; sled riding is not available on this flight.</strong>
                  </p>
                </div>
              )}
              <Link
                href={isNorthStar405050 ? `/tours/${company}/${item}/calendar` : bookingPageHref}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition uppercase tracking-wider"
              >
                {hasNextAvailability
                  ? "Check availability"
                  : isNorthStar405050
                  ? "Check Departures"
                  : "Check Live Calendar"}
              </Link>

              {isNorthStar405050 && (
                <Link
                  href="/juneau/helicopter-tours"
                  className="w-full rounded-2xl border border-sky-600 bg-sky-50 py-3 text-center text-xs font-bold text-sky-900 hover:bg-sky-100 transition uppercase tracking-wider"
                >
                  View May–August Helicopter Tours
                </Link>
              )}
              
              <div className="flex gap-2">
                <Link
                  href="/tours"
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Compare Tours
                </Link>
                <Link
                  href={`/guides/how-long-does-it-take-to-get-off-the-ship-in-${safeTour.port}`}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Port guide
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-[11px] text-slate-700 space-y-3">
              <span className="font-black text-slate-900 uppercase tracking-wider text-[9px] block">Verified Booking Terms</span>
              <div className="flex gap-2">
                <span>🏔️</span>
                <p className="leading-normal"><strong>Operator:</strong> Operated directly by <strong>{operatorName}</strong> in {portName}.</p>
              </div>
              {isTemsco561 && (
                <div className="flex gap-2">
                  <span>🐕</span>
                  <p className="leading-normal"><strong>Format:</strong> Musher demonstration on snow, kennel tour, and puppy interaction. Sled riding is not available.</p>
                </div>
              )}
              <div className="flex gap-2">
                <span>💳</span>
                <p className="leading-normal"><strong>Payment & Voucher:</strong> Billed securely by Welcome to Alaska Tours via Stripe. Instant confirmation voucher issued.</p>
              </div>
              <div className="flex gap-2">
                <span>📍</span>
                <p className="leading-normal">
                  <strong>Port Pickup:</strong> {isTemsco && safeTour.port === "skagway"
                    ? "Self check-in at TEMSCO Skagway heliport base (101 Terminal Way, walkable from Ore/Broadway docks); return transfer back to cruise berths included."
                    : `Staged for ${portName} cruise berths (including shuttle transit guidance for outer docks).`}
                </p>
              </div>
              <div className="flex gap-2">
                <span>🛡️</span>
                <p className="leading-normal"><strong>Cancellation Policy:</strong> {cancellationPolicyInfo.shortTerms}</p>
              </div>
              <div className="flex gap-2">
                <span>⏱️</span>
                <p className="leading-normal"><strong>Safety Margin:</strong> {bufferMinutes}-minute return cushion enforced before ship all-aboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Facts Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Tour Specifications & Facts
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Duration</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{duration || "Check details"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Operating Season</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{seasonality}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Minimum Age</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{ageConstraint || "All ages welcome"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Activity Level</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{activityLevel || "Easy to Moderate"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Price (Flat Rate)</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{safeTour.fromPrice || "Check Price"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Passenger Policy</span>
              <span className="mt-1 font-bold text-slate-900 block text-xs">{weightPolicy || "Standard port check-in"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Availability</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">
                {hasNextAvailability
                  ? "Live dates active"
                  : isNorthStar405050
                  ? "September only (Check departures)"
                  : "Check departures"}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Safety Buffer</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{bufferMinutes} mins minimum</span>
            </div>
            {isTemsco561 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 col-span-2 sm:col-span-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Sled Riding Policy</span>
                <span className="mt-1 font-bold text-slate-900 block text-xs">Demonstration &amp; interaction only (Guests cannot ride the sled on this flight)</span>
              </div>
            )}
          </div>
        </section>

        {/* Cruise Day Fit Panel */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Cruise Ship Compatibility Evaluation
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 max-w-3xl">
              {getCruiseFitSubtitle(isHeliOrAir, isBoat, portName)}
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">Who This Excursion Is For</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-655">{bestForText}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-800">Who Should Skip This</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-655">{skipText}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Timing & Buffer Note</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {getTimingBufferNote(isHeliOrAir, isBoat)}
              </p>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-[10px] text-amber-900">
                <strong>🚨 Return Buffer Rule:</strong> Keep a minimum {bufferMinutes}-minute buffer between the tour return time and your ship's scheduled all-aboard time. Confirm your ship's exact all-aboard time before booking.
              </div>
            </div>
          </div>
        </section>

        {/* Full Product Info */}
        <section className="prose max-w-none space-y-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900">Tour Overview & Operator Notes</h2>
          {isTemsco561 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-1.5 not-prose">
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-900 block">
                ⚠️ Operator Notice (TEMSCO Helicopters): Demonstration Only — No Sled Riding
              </span>
              <p className="leading-relaxed text-slate-800">
                TEMSCO explicitly notes that guests cannot ride the dog sled on this excursion. This tour is an aerial glacier flight, kennel tour, and musher presentation where guests observe the dog team running the snow trail and interact with sled dogs and puppies. <strong>Sled riding is not available on this flight.</strong>
              </p>
            </div>
          )}
          <p className="text-sm leading-relaxed text-slate-655 max-w-4xl">
            {description}
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Check-in Mappings</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {getCheckInMappingText(isHeliOrAir, isBoat, portName, safeTour.company)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Pre-Payment Cancellation Deadlines</h3>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                {cancellationPolicyInfo.overviewCardText}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-6 border-t border-slate-100">
          <FAQSection
            title="Shore Excursion Timing & Safety FAQs"
            faqs={renderedFaqs}
          />
        </section>
      </main>
    </>
  );
}

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
  const isNorthStar405050 =
    (company === "northstartrekking" && (String(pk) === "405050" || lower.includes("northstar"))) ||
    String(pk) === "405050";

  // 1. Duration
  let duration = "";
  const compoundMatch = desc.match(/\b(\d+)\s*Hours?\s*(?:&|and)\s*(\d+)\s*Minutes?\b/i);
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
        } else if (val === 3.5) {
          duration = "3 Hours 30 Minutes";
        } else {
          duration = `${durationMatch[1]} Hours`;
        }
      }
    }
  }

  if (!duration && isNorthStar405050) {
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
  } else if (lower.includes("helicopter") || lower.includes("flight")) {
    weightPolicy = "Standard passenger weight check";
  }

  return { duration, activityLevel, ageConstraint, seasonality, weightPolicy, isNorthStar405050 };
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

function getCheckInMappingText(isHeliOrAir: boolean, isBoat: boolean, portName: string) {
  if (isHeliOrAir) {
    return `Departures include round-trip shuttle service from downtown ${portName} cruise terminal staging points directly to the heliport. Complete pickup coordinates, vehicle signage, and departure times are emailed directly upon checkout confirmation.`;
  }
  if (isBoat) {
    return `Tours stage from designated cruise berth loading zones or harbor docks in ${portName}. Round-trip pier transfers or walking directions from your specific ship dock are emailed directly upon checkout confirmation.`;
  }
  return `Departures meet near downtown ${portName} cruise docks or designated port pickup points. Detailed meeting instructions, staging maps, and local dispatch contacts are emailed directly upon checkout confirmation.`;
}

function getCancellationPolicyText(isHeliOrAir: boolean, isBoat: boolean, operatorName: string) {
  if (isHeliOrAir) {
    return `Strict aviation safety rules apply. In the event of mountain weather cancellations by ${operatorName} or if your cruise ship misses port, guests receive a 100% full refund with zero penalty.`;
  }
  if (isBoat) {
    return `In the event that severe marine weather or safety conditions force cancellation by ${operatorName}, guests receive a 100% full refund with zero penalty. Guest-initiated cancellations follow operator cut-off policies (please review the specific cancellation deadlines on your booking confirmation voucher).`;
  }
  return `In the event of operator cancellation due to weather or safety, guests receive a 100% full refund. Guest-initiated cancellations follow operator cut-off policies.`;
}

function getWhoItIsBestFor(title: string, category: string) {
  const text = (title + " " + category).toLowerCase();
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
  if (isGenericDescription(description)) {
    description = `Book the ${safeTour.title} operated by ${operatorName}. Verify cruise schedule fit and check real-time availability.`;
  }

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
  const { duration, activityLevel, ageConstraint, seasonality, weightPolicy, isNorthStar405050 } = parseTourDescriptionDetails(
    safeTour.title,
    safeTour.description,
    safeTour.company,
    safeTour.pk || item,
  );
  if (isNorthStar405050) {
    safeTour.fromPrice = "$419 Per Person (Flat Rate)";
  }
  const bestForText = getWhoItIsBestFor(safeTour.title, categoryName);
  const skipText = getWhoShouldSkip(safeTour.title, activityLevel, ageConstraint);

  const hasRealOperatorImage = Boolean(safeTour.image && String(safeTour.image).trim());
  const fallbackHero = safeTour.port === "ketchikan" ? "/hero/ketchikan.png" : safeTour.port === "skagway" ? "/hero/skagway.jpg" : "/hero/juneau.jpg";
  const heroSrc = hasRealOperatorImage ? safeTour.image! : fallbackHero;
  let description = cleanTourDescription(safeTour.description, "Alaska excursion.");
  if (isGenericDescription(description)) {
    description = "Experience a premier excursion during your port day in Alaska. Review live departures and availability below to secure your booking.";
  }

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
  const numericPrice = isNorthStar405050 ? "419" : (priceMatch ? priceMatch[0] : null);
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
          : "Departures stage in downtown Skagway along 2nd Avenue or at the Small Boat Harbor, a level 5 to 10-minute walk from the Railroad Dock, Broadway Dock, and Ore Dock.",
    },
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
          ? `Aircraft weight and balance calculations are required for all flights. ${isNorthStar405050 ? "NorthStar charges an additional $150 operator weight surcharge for passengers weighing 250 lbs (113 kg) or more to reserve adequate aircraft space. Minimum age: Ages 7+." : "Guests weighing 250 lbs or more may require an adjacent seat or weight surcharge in accordance with operator guidelines. " + (ageConstraint ? `Age policy: ${ageConstraint}.` : "Children of all ages are welcome.")}`
          : `${ageConstraint ? `Age policy: ${ageConstraint}.` : "All ages are welcome."} Dress in warm layers with a waterproof outer jacket and flat, comfortable walking shoes. Specialized gear (neoprene overboots, spray skirts, or flotation suits) is furnished by ${operatorName}.`,
    },
    {
      question: `What happens if weather cancels the tour or my ship misses port?`,
      answer: isHeliOrAir
        ? `Flight safety is paramount in Southeast Alaska. If mountain weather prevents safe flying, ${operatorName} cancels the flight and issues a 100% full refund with zero cancellation penalty. If your cruise ship cancels the port call or bypasses ${portName} due to weather or itinerary changes, your booking is fully refunded upon verification.`
        : `Safety is paramount in Southeast Alaska. If severe marine weather or safety conditions prevent operations and ${operatorName} cancels the tour, you receive a 100% full refund with zero penalty. Guest-initiated cancellations follow operator cut-off policies as detailed on your confirmation voucher.`,
    },
    {
      question: "Is the listed price per person or for the entire group, and what is included?",
      answer: isPrivate
        ? "This is a private charter flat rate. The price covers your entire private party up to the vessel or vehicle's maximum licensed capacity, with dedicated exclusive guide and captain service."
        : `The price (${safeTour.fromPrice || "listed rate"}) is a verified flat rate per person (or per adult where age tiers apply). It includes all required local port staging, certified guide service, and gear. Taxes are transparently itemized with zero surprise booking fees at checkout.${isNorthStar405050 ? " Note: NorthStar applies a $150 weight surcharge for passengers 250+ lbs." : ""}`,
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
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 lg:hidden">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Tour Price (Flat Rate)</span>
                <span className="text-xl font-black text-slate-900">{safeTour.fromPrice || "Check Price"}</span>
              </div>
              <Link
                href={isNorthStar405050 ? `/tours/${company}/${item}/calendar` : bookingPageHref}
                className="flex-1 max-w-[200px] rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition uppercase tracking-wider"
              >
                {isNorthStar405050 ? "Check Departures" : "Book Now"}
              </Link>
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
              <div className="flex gap-2">
                <span>💳</span>
                <p className="leading-normal"><strong>Payment & Voucher:</strong> Billed securely by Welcome to Alaska Tours via Stripe. Instant confirmation voucher issued.</p>
              </div>
              <div className="flex gap-2">
                <span>📍</span>
                <p className="leading-normal"><strong>Port Pickup:</strong> Staged for {portName} cruise berths (including shuttle transit guidance for outer docks).</p>
              </div>
              <div className="flex gap-2">
                <span>🛡️</span>
                <p className="leading-normal"><strong>Cancellation Protection:</strong> {isHeliOrAir ? "100% refund if weather cancels the flight or if your ship misses port." : "100% refund if the activity is canceled by the operator due to weather or safety."}</p>
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
          <p className="text-sm leading-relaxed text-slate-655 max-w-4xl">
            {description}
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Check-in Mappings</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {getCheckInMappingText(isHeliOrAir, isBoat, portName)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Cancellation Policy</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {getCancellationPolicyText(isHeliOrAir, isBoat, operatorName)}
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

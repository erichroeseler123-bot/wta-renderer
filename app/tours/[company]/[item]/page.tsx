import FAQSection from "@/app/components/faq/FAQSection";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import HandoffTracker from "@/app/components/tours/HandoffTracker";
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

function parseTourDescriptionDetails(title: string, description?: string | null) {
  const desc = String(description || "");
  
  // 1. Duration
  let duration = "";
  const durationMatch = desc.match(/\b(\d+(?:\.\d+)?)\s*Hours?\b/i);
  if (durationMatch) {
    duration = `${durationMatch[1]} Hours`;
  }
  
  // 2. Activity Level / Difficulty
  let activityLevel = "";
  const difficultyMatch = desc.match(/Difficulty:\s*([^|]+)/i) || desc.match(/Difficulty\s*([^|]+)/i);
  if (difficultyMatch) {
    activityLevel = difficultyMatch[1].trim();
  } else {
    const lower = (title + " " + desc).toLowerCase();
    if (lower.includes("strenuous") || lower.includes("trek") || lower.includes("active") || lower.includes("hike")) {
      activityLevel = "Moderate to Strenuous";
    } else if (lower.includes("easy") || lower.includes("all ages") || lower.includes("flightseeing")) {
      activityLevel = "Easy";
    } else {
      activityLevel = "Easy to Moderate";
    }
  }

  // 3. Age Constraints
  let ageConstraint = "";
  const ageMatch = desc.match(/\b(\d+)\+/);
  if (ageMatch) {
    ageConstraint = `Ages ${ageMatch[1]}+`;
  }

  return { duration, activityLevel, ageConstraint };
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
      canonical: `https://welcometoalaskatours.com/tours/${company}/${item}`,
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

  const { duration, activityLevel, ageConstraint } = parseTourDescriptionDetails(safeTour.title, safeTour.description);
  const bestForText = getWhoItIsBestFor(safeTour.title, categoryName);
  const skipText = getWhoShouldSkip(safeTour.title, activityLevel, ageConstraint);

  const heroSrc = safeTour.image && String(safeTour.image).trim() ? safeTour.image : "/hero/juneau.jpg";
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

  let timingStatus: "safe" | "tight" | "unsafe" | "unknown" = "unknown";
  let timingGuidanceText = "";
  let bufferMinutes = 45; // default

  if (shipArrival && shipDeparture && duration) {
    const durationMinutesMatch = duration.match(/(\d+(?:\.\d+)?)/);
    const durationHours = durationMinutesMatch ? parseFloat(durationMinutesMatch[1]) : 0;
    const durationMinutes = Math.round(durationHours * 60);

    if (durationMinutes > 0) {
      const arrMin = parseTimeToMinutes(shipArrival);
      const depMin = parseTimeToMinutes(shipDeparture);
      if (arrMin !== null && depMin !== null) {
        const allAboardMin = depMin - 30;
        const earliestSafeStart = arrMin + 45;
        const latestSafeStart = allAboardMin - durationMinutes - 45;

        if (latestSafeStart >= earliestSafeStart) {
          timingStatus = "safe";
          timingGuidanceText = `This excursion fits your port window. For the ${cruiseShip} (${shipWindow}), departures for this ${duration} tour starting between ${formatMinutesToTime(earliestSafeStart)} and ${formatMinutesToTime(latestSafeStart)} leave the recommended safety buffer.`;
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
      timingGuidanceText = `Enter or confirm your ship timing for the ${cruiseShip} to check compatibility. Ensure your excursion fits with a 45-minute return buffer before all-aboard time.`;
    } else {
      timingGuidanceText = `Enter your cruise ship details to check timing compatibility. We recommend leaving a return buffer of at least 45 minutes before your ship's all-aboard time.`;
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
  const numericPrice = priceMatch ? priceMatch[0] : null;
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
      question: "Will this fit my cruise ship schedule?",
      answer: "Excursion timing compatibility depends directly on your cruise ship's port arrival and departure window. Ensure the tour start time leaves a return safety buffer before your scheduled all-aboard time."
    },
    {
      question: "How much return buffer should I leave?",
      answer: "We recommend a minimum 45-minute return safety buffer for standard excursions and 60 minutes for high-altitude glacier landings or flightseeing to allow for weather checks and transit logistics."
    },
    {
      question: "What should I confirm before booking?",
      answer: "Always confirm your ship's exact all-aboard time (typically 30 minutes before departure) and check the tour duration against your port day calendar before final checkout."
    },
    {
      question: "Is this good for families?",
      answer: "Yes, many tours accommodate all ages. However, glacier hiking and trekking excursions may have minimum age restrictions (such as 8+ or 12+) due to gear outfitting constraints."
    },
    {
      question: "What happens if weather affects flightseeing?",
      answer: "Safety is the operator's top priority. If your flightseeing tour is cancelled due to weather, you will receive a full refund. We recommend booking flights earlier in the day when weather is typically most stable."
    },
    {
      question: "Where do I confirm exact departure details?",
      answer: "Your booking confirmation email will contain the operator's local office contact number, exact check-in address at the port, and departure instructions."
    }
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Starting Price</span>
                <span className="text-xl font-black text-slate-900">{safeTour.fromPrice || "Check Price"}</span>
              </div>
              <Link
                href={bookingPageHref}
                className="flex-1 max-w-[200px] rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition uppercase tracking-wider"
              >
                Book Now
              </Link>
            </div>

            {/* Main Hero Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-stone-200 shadow-md">
              <Image
                src={heroSrc}
                alt={safeTour.title}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-w-7xl) 100vw, 1200px"
              />
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starting Price</span>
              <div className="mt-1 text-3xl font-black text-slate-900 leading-none">
                {safeTour.fromPrice || "Check Price"}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Live Status</span>
              <span className="mt-1 font-bold text-slate-900 block text-xs">
                {hasNextAvailability ? `Next available: ${safeTour.nextAvailableDate}` : "Check calendar for departures"}
              </span>
            </div>

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
                href={bookingPageHref}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition uppercase tracking-wider"
              >
                {hasNextAvailability ? "Check availability" : "Check Live Calendar"}
              </Link>
              
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

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[10px] text-slate-500 space-y-1">
              <div>• Secure payment processing via Stripe</div>
              <div>• Instant operator confirmation on booking</div>
              <div>• Cruise-day buffer protection guarantee</div>
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Port Destination</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{portName}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Operator Code</span>
              <span className="mt-1 font-bold text-slate-950 block text-sm">{operatorName}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Activity Rating</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{activityLevel || "Easy to Moderate"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Minimum Age</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{ageConstraint || "All ages welcome"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">From Price</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{safeTour.fromPrice || "Check Price"}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Availability</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">{hasNextAvailability ? "Live dates active" : "Check departures"}</span>
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
              Helicopter flights and glacial excursions require tight alignment with your port timeline.
              Evaluate the metrics below before final booking.
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
                Weather cancellations or delays can happen due to high-altitude visibility checks. Always schedule flights earlier in your port day to ensure proper safety room.
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
                Departures leave from designated airport heliports or cruise terminal sync-points. Complete instructions, transportation maps, and pickup details will be emailed directly to you upon check-out confirmation.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Cancellation Policy</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Strict safety flight rules apply. In the event of weather cancellations or delays by the operator, guests receive a full refund. Excursion timing modifications can be requested subject to availability.
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

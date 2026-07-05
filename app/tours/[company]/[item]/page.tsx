import FAQSection from "@/app/components/faq/FAQSection";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import HandoffTracker from "@/app/components/tours/HandoffTracker";
import { getHelicopterTour } from "@/lib/helicopterTours";
import { CRUISE_ITINERARY_HINTS, type CruiseShipName } from "@/lib/cruiseShips";
import { parseTimeToMinutes, formatMinutesToTime } from "@/lib/timing";
import {
  buildTourBreadcrumbSchema,
  buildTourFaqs,
  buildTourUrl,
  cleanTourDescription,
  sanitizeTour,
} from "@/lib/tourSeo";
import { notFound } from "next/navigation";
import StageTelemetry from "@/app/components/plan/StageTelemetry";
import Link from "next/link";

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
    return "Best for active families and travelers wanting a classic Alaskan dog sled experience.";
  }
  if (text.includes("whale") || text.includes("marine") || text.includes("boat")) {
    return "Best for wildlife enthusiasts and families looking for high-probability marine views.";
  }
  if (text.includes("hike") || text.includes("trek") || text.includes("glacier")) {
    return "Best for active travelers who want to trek on ice fields.";
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

  const seoData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: safeTour.title || "Alaska Excursion",
    description,
    image: heroSrc,
    url: buildTourUrl(safeTour),
    provider: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
    },
  };
  const breadcrumbSchema = buildTourBreadcrumbSchema(safeTour);
  const faqs = buildTourFaqs(safeTour);

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

  const hasNextAvailability = Boolean(safeTour.nextAvailableDate);

  // Evaluate Timing Safety
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
          timingGuidanceText = `This excursion fits your port window. For the ${cruiseShip} (${shipWindow}), departures for this ${duration} tour starting between ${formatMinutesToTime(earliestSafeStart)} and ${formatMinutesToTime(latestSafeStart)} leave the recommended return buffer.`;
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
      border: "border-emerald-200 bg-emerald-50 text-emerald-950",
      title: "✅ Safe return window",
      icon: "Safe",
    },
    tight: {
      border: "border-amber-200 bg-amber-50 text-amber-955",
      title: "⚠️ Tight return window",
      icon: "Tight",
    },
    unsafe: {
      border: "border-rose-200 bg-rose-50 text-rose-955",
      title: "❌ Excursion timing warning",
      icon: "Unsafe",
    },
    unknown: {
      border: "border-slate-200 bg-slate-50 text-slate-900",
      title: "ℹ️ Confirm ship timing",
      icon: "Unknown",
    },
  }[timingStatus];

  return (
    <>
      <StageTelemetry payload={telemetryPayload} enabled={Boolean(getParam(sp.from) === "plan" || getParam(sp.requestedLane))} />
      <HandoffTracker port={safeTour.port} slug={safeTour.slug} />
      <JsonLd data={seoData} />
      <JsonLd data={breadcrumbSchema} />
      
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 text-slate-900 bg-white">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/tours", label: "Tours" },
            { href: `/ports/${safeTour.port}`, label: portName },
            { label: safeTour.title },
          ]}
        />

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 uppercase tracking-wide">
                {categoryName}
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-tight">
                {safeTour.title}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Operated by <strong className="text-slate-800">{operatorName}</strong> in {portName}, Alaska
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-stone-200 shadow-sm">
              <img
                src={heroSrc}
                alt={safeTour.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Port</span>
                <span className="mt-1 font-bold text-slate-900 block">{portName}</span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Duration</span>
                <span className="mt-1 font-bold text-slate-900 block">{duration || "Check operator details"}</span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Activity Level</span>
                <span className="mt-1 font-bold text-slate-900 block">{activityLevel || "Check operator details"}</span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Age Limit</span>
                <span className="mt-1 font-bold text-slate-900 block">{ageConstraint || "All ages"}</span>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="text-xl font-black tracking-tight text-slate-900">Tour Overview</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-655">
                {description}
              </p>
            </div>

            <hr className="border-slate-200" />

            {/* Deciders / Best For / Skip It */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-800">Who It Is Best For</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{bestForText}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-rose-800">Who Should Skip This</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{skipText}</p>
              </div>
            </div>

            {/* Timing Safeguard warning */}
            <div className={`rounded-2xl border p-5 ${timingConfig.border}`}>
              <h3 className="text-sm font-black uppercase tracking-wider">{timingConfig.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-900">
                {timingGuidanceText}
              </p>
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="self-start lg:sticky lg:top-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Availability Pricing</span>
              <div className="mt-1 text-3xl font-black text-slate-900">
                {safeTour.fromPrice || "Check Price"}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Next Available Date</span>
              <span className="mt-1 font-bold text-slate-900 block text-sm">
                {hasNextAvailability ? safeTour.nextAvailableDate : "Check calendar for departures"}
              </span>
            </div>

            <div className="grid gap-3">
              <Link
                href={bookingPageHref}
                className="w-full rounded-2xl bg-slate-900 py-4 text-center text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                {hasNextAvailability ? "Book This Tour" : "Check Live Dates"}
              </Link>
              <Link
                href="/tours"
                className="w-full rounded-2xl border border-slate-200 py-4 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse All Tours
              </Link>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
              <div>• Secure checkouts via Stripe</div>
              <div>• Instant confirmation on booking</div>
              <div>• Safe Return guarantee for cruise days</div>
            </div>
          </div>
        </div>
      </main>

      <FAQSection title={`${safeTour.title} FAQs`} faqs={faqs} />
    </>
  );
}

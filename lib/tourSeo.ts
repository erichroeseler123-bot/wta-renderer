import type { HelicopterTour } from "@/lib/helicopterTours";

export function getProductOneLiner(tour: { title?: string | null; category?: string | null; port?: string | null; company?: string | null; pk?: number | string | null }) {
  const title = (tour.title || "").toLowerCase();
  const category = (tour.category || "").toLowerCase();
  const port = (tour.port || "juneau").toLowerCase();
  const portName = port.charAt(0).toUpperCase() + port.slice(1);
  const comp = String(tour.company || "").toLowerCase();

  // Floatplane / seaplane flightseeing (e.g. Taquan Air in Ketchikan or Wings Airways in Juneau)
  if (comp.includes("taquan") || title.includes("seaplane") || title.includes("floatplane") || (port === "ketchikan" && (title.includes("flight") || category.includes("air")))) {
    if (title.includes("bear")) {
      return `Remote floatplane wilderness flightseeing and coastal bear viewing in ${portName}.`;
    }
    return `Scenic floatplane flightseeing across Misty Fjords National Monument from ${portName}.`;
  }

  // Helicopter flightseeing
  if (title.includes("helicopter") || (category.includes("air") && port !== "ketchikan")) {
    if (title.includes("dog") || title.includes("sled")) {
      return `Glacier helicopter flightseeing and alpine husky dog sledding camp in ${portName}.`;
    }
    return `Helicopter flightseeing and glacier landing built for a shorter ${portName} port window.`;
  }

  if (title.includes("dog") || title.includes("sled") || title.includes("mush")) {
    return `Authentic sled dog demonstration and musher experience tailored to your ${portName} timetable.`;
  }

  // Ketchikan Duck Tour
  if (comp.includes("akduck") || title.includes("duck")) {
    return `Classic 90-minute amphibious sightseeing tour through historic downtown and Ketchikan harbor.`;
  }

  // Boardwalk / Rainforest / Bear tours
  if (title.includes("boardwalk") || title.includes("bear") || comp.includes("alaskarainforest")) {
    return `Rainforest wildlife sanctuary and boardwalk nature walk in ${portName}.`;
  }

  // Hiking & Glaciers (only if glacier or actual mountain trek)
  if ((title.includes("trek") || title.includes("glacier") || title.includes("ice")) && !title.includes("boardwalk")) {
    return `Ice trekking and guided glacier walks optimized for active cruise days in ${portName}.`;
  }
  if (title.includes("hike") && !title.includes("boardwalk")) {
    return `Guided rainforest and mountain hiking optimized for active cruise days in ${portName}.`;
  }

  if (title.includes("whale") || title.includes("watching") || category.includes("whale")) {
    return `Marine wildlife and whale watching timed for a safe return during your ${portName} port day.`;
  }
  return `${portName} adventure route with live date availability and cruise-day timing guidance.`;
}

export function cleanTourDescription(description?: string | null, fallback?: string) {
  let source = String(description || fallback || "")
    .replace(/\$\$/g, "$")
    .replace(/\s+/g, " ")
    .trim();
  source = source.replace(/^Starting at\s+/i, "");
  return source || "Review the tour details, then continue to the booking page to choose a date.";
}

function extractDollarAmount(text?: string | null) {
  const match = String(text || "").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const dollars = Number(String(match[1]).replace(/,/g, ""));
  return Number.isFinite(dollars) && dollars > 0 ? dollars : null;
}

export function buildTourPriceLabel(
  tour: Pick<HelicopterTour, "company" | "description" | "fromPrice"> & { pk?: number }
) {
  if (tour.company === "northstartrekking" && (tour as any)?.pk === 405050) {
    return "$419 Per Person (Flat Rate)";
  }
  const description = cleanTourDescription(tour.description);
  const headlinePrice = extractDollarAmount(description);

  if (tour.company === "northstartrekking") {
    if (headlinePrice) return `$${headlinePrice} Per Person (Flat Rate)`;
    if (description.includes("25% Deposit")) return "Check live pricing";
  }

  const p = tour.fromPrice || "Check live pricing";
  return p.startsWith("From ") ? p.replace(/^From\s+/i, "") + " (Flat Rate)" : p;
}

export function buildTourUrl(tour: Pick<HelicopterTour, "company" | "pk">) {
  return `https://www.welcometoalaskatours.com/tours/${tour.company}/${tour.pk}`;
}

export function sanitizeTour<T extends Pick<HelicopterTour, "description"> & { company?: string; pk?: number | string; fromPrice?: string; category?: string }>(tour: T): T {
  const comp = String(tour.company || "").toLowerCase();
  const pkStr = String(tour.pk || "");
  const isNorthStar405050 = comp === "northstartrekking" && pkStr === "405050";
  const isTemsco556 = comp === "temscoair-skagway" && pkStr === "213556";
  const isTemsco561 = comp === "temscoair-skagway" && pkStr === "213561";
  const isAkDuck4161 = comp === "akduck" && pkStr === "4161";
  const isBearsBrews563489 = comp === "alaskarainforest" && pkStr === "563489";
  const isTaquan392949 = comp === "taquanair" && pkStr === "392949";
  const isTaquan392950 = comp === "taquanair" && pkStr === "392950";

  let fromPrice = tour.fromPrice;
  let description = cleanTourDescription(tour.description);
  let category = tour.category;

  if (isNorthStar405050) {
    fromPrice = "$419 Per Person (Flat Rate)";
    description = description
      .replace(/\$388\s*(?:Per\s*Person)?/gi, "$419 Per Person (Flat Rate)")
      .replace(/\$405\s*(?:Per\s*Person)?/gi, "$419 Per Person (Flat Rate)");
  } else if (isTemsco556) {
    fromPrice = "$439 Per Person (Flat Rate)";
    description = "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk";
  } else if (isTemsco561) {
    fromPrice = "$599 Per Person (Flat Rate)";
    description = "$599 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Dog Sledding Demonstration (No Sled Riding)";
  } else if (isAkDuck4161) {
    fromPrice = "$79 Adult / $47 Child (Flat Rate)";
    description = "90 Minutes • All Ages • Historic downtown Ketchikan & scenic harbor splash";
    category = "Adventures";
  } else if (isBearsBrews563489) {
    description = "3.5 Hours • All Ages (Brewery 21+) • Rainforest boardwalk bear viewing & craft brewery tasting";
    category = "Adventures";
  } else if (isTaquan392949) {
    fromPrice = "$369 Per Person (Flat Rate)";
    description = "Floatplane Flightseeing • 2 Hours • All Ages • Remote fjord water landing";
    category = "Air Tours";
  } else if (isTaquan392950) {
    fromPrice = "$399 Per Person (Flat Rate)";
    description = "Floatplane Bear Viewing • 3 Hours 15 Minutes • All Ages • Traitors Cove / Neets Bay";
    category = "Air Tours";
  }

  description = description.replace(/^Starting at\s+/i, "");

  return {
    ...tour,
    description,
    fromPrice,
    category,
  };
}

export function sanitizeTours<T extends Pick<HelicopterTour, "description"> & { company?: string; pk?: number | string; fromPrice?: string }>(tours: T[]): T[] {
  return tours.map((tour) => sanitizeTour(tour));
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": "https://www.welcometoalaskatours.com/#organization",
    name: "Welcome To Alaska Tours",
    url: "https://www.welcometoalaskatours.com",
    telephone: "+1-907-723-8908",
    email: "hello@welcometoalaskatours.com",
    logo: "https://www.welcometoalaskatours.com/apple-touch-icon.png",
    areaServed: ["Juneau, Alaska", "Skagway, Alaska", "Ketchikan, Alaska"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-907-723-8908",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.welcometoalaskatours.com/#website",
    name: "Welcome To Alaska Tours",
    url: "https://www.welcometoalaskatours.com",
    inLanguage: "en-US",
    publisher: {
      "@id": "https://www.welcometoalaskatours.com/#organization",
    },
  };
}

export function buildTourFaqs(tour: Pick<HelicopterTour, "title" | "port">) {
  const port = String(tour.port || "Alaska");
  const portName = port.charAt(0).toUpperCase() + port.slice(1);

  return [
    {
      question: `How do I check live availability for ${tour.title}?`,
      answer:
        "Open the booking calendar to review currently posted dates and departure times before checkout.",
    },
    {
      question: `Is ${tour.title} suitable for a ${portName} cruise day?`,
      answer:
        `Match the tour date and timing to your ${portName} port schedule and leave enough buffer to return to the ship comfortably.`,
    },
    {
      question: `What should I review before booking ${tour.title}?`,
      answer:
        "Check the published duration, age notes, pricing, meeting details, and live availability on the booking page before confirming.",
    },
  ];
}

export function buildTourBreadcrumbSchema(
  tour: Pick<HelicopterTour, "title" | "company" | "pk">
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.welcometoalaskatours.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tours",
        item: "https://www.welcometoalaskatours.com/tours",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tour.title,
        item: buildTourUrl(tour),
      },
    ],
  };
}

export function buildTourItemListSchema(
  tours: Array<Pick<HelicopterTour, "title" | "company" | "pk">>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Alaska shore excursions in Juneau, Skagway, and Ketchikan",
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tour.title,
      url: buildTourUrl(tour),
    })),
  };
}

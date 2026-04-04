import type { HelicopterTour } from "@/lib/helicopterTours";

export function cleanTourDescription(description?: string | null, fallback?: string) {
  const source = String(description || fallback || "")
    .replace(/\$\$/g, "$")
    .replace(/\s+/g, " ")
    .trim();
  return source || "Review the tour details, then continue to the booking page to choose a date.";
}

function extractDollarAmount(text?: string | null) {
  const match = String(text || "").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const dollars = Number(String(match[1]).replace(/,/g, ""));
  return Number.isFinite(dollars) && dollars > 0 ? dollars : null;
}

export function buildTourPriceLabel(
  tour: Pick<HelicopterTour, "company" | "description" | "fromPrice">
) {
  const description = cleanTourDescription(tour.description);
  const headlinePrice = extractDollarAmount(description);

  if (tour.company === "northstartrekking") {
    if (headlinePrice) return `From $${headlinePrice}`;
    if (description.includes("25% Deposit")) return "Check live pricing";
  }

  return tour.fromPrice || "Check live pricing";
}

export function buildTourUrl(tour: Pick<HelicopterTour, "company" | "pk">) {
  return `https://welcometoalaskatours.com/tours/${tour.company}/${tour.pk}`;
}

export function sanitizeTour<T extends Pick<HelicopterTour, "description">>(tour: T): T {
  return {
    ...tour,
    description: cleanTourDescription(tour.description),
  };
}

export function sanitizeTours<T extends Pick<HelicopterTour, "description">>(tours: T[]): T[] {
  return tours.map((tour) => sanitizeTour(tour));
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Welcome To Alaska Tours",
    url: "https://welcometoalaskatours.com",
    logo: "https://welcometoalaskatours.com/apple-touch-icon.png",
    sameAs: [
      "https://www.welcometoalaskatours.com",
      "https://wta-ui.vercel.app",
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Welcome To Alaska Tours",
    url: "https://welcometoalaskatours.com",
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
      url: "https://welcometoalaskatours.com",
    },
  };
}

export function buildTourFaqs(tour: Pick<HelicopterTour, "title">) {
  return [
    {
      question: `How do I check live availability for ${tour.title}?`,
      answer:
        "Open the booking calendar to review currently posted dates and departure times before checkout.",
    },
    {
      question: `Is ${tour.title} suitable for a Juneau cruise day?`,
      answer:
        "Match the tour date and timing to your port schedule and leave enough buffer to return to the ship comfortably.",
    },
    {
      question: `What should I review before booking ${tour.title}?`,
      answer:
        "Check the published duration, age notes, pricing, and live availability on the booking page before confirming.",
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
        item: "https://welcometoalaskatours.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tours",
        item: "https://welcometoalaskatours.com/tours",
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
    name: "Juneau helicopter tours",
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tour.title,
      url: buildTourUrl(tour),
    })),
  };
}

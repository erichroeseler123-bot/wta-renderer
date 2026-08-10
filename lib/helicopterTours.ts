import path from "path";
import { promises as fs } from "fs";
import { unstable_cache } from "next/cache";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { getToursFromFareHarbor, type Tour as FareHarborTour } from "@/lib/data/tours";
import { getFareHarborAvailabilities } from "@/lib/fareharborAvailability";
import { cleanTourDescription } from "@/lib/tourSeo";

export type HelicopterTour = {
  pk: number;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  imageGallery?: string[];
  company: string;
  port: string;
  fromPrice?: string;
  category?: string;
  nextAvailableDate?: string;
  hasInventory?: boolean | null;
};

export type HelicopterTourDeparture = {
  company: string;
  itemPk: number;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  fromPrice?: string;
  availabilityPk: number;
  startAt: string;
  capacity: number | null;
  priceCents?: number;
};

type SnapshotTour = {
  pk?: number | string;
  slug?: string;
  title?: string;
  headline?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  company?: string;
  fromPrice?: string;
  category?: string;
  fareharbor?: {
    itemPk?: number | string;
    company?: string;
  };
};

// FareHarbor exposes some operational/local-only items alongside public excursions.
// Keep the storefront broad, but do not merchandise obvious admin, transfer, fundraiser,
// membership, dock-sale, or rental records as normal shore excursions.
const BLOCKED_ITEM_IDS = new Set<number>([
  69803, // Harv & Marv private van
  708105, // local membership
  711990, // local membership rate
  143422, // Alaska Tales water taxi
  54996, // Moore Charters water taxi
  328657, // Ketchikan Duck transfer
  99962, // Hummer dock sales
  503982, // Coastal Christmas fundraiser
  625752, // Coastal Local's Day
]);

const BLOCKED_TITLE_PATTERNS = [
  /\bgift\s*(card|certificate)\b/i,
  /\blocal\s+membership\b/i,
  /\bmembership\s+rate\b/i,
  /\bdock\s+sales\b/i,
  /\bwater\s+taxi\b/i,
  /^transfer$/i,
  /\bfundrais/i,
  /\blocal'?s\s+day\b/i,
  /\bboat\s+rentals?\b/i,
  /\bharley\s+davidson\s+rentals?\b/i,
  /\bscooter\s+rentals?\b/i,
  /^klr650$/i,
  /^honda\s+shadow$/i,
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function inferCategory(title: string, description: string, explicit?: string) {
  if (explicit) return explicit;
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("whale")) return "Whale Watching";
  if (text.includes("dog") || text.includes("sled") || text.includes("husky")) return "Dog Sledding";
  if (text.includes("helicopter") || text.includes("flightseeing") || text.includes("seaplane") || text.includes("flight")) return "Air Tours";
  if (text.includes("fish") || text.includes("halibut") || text.includes("salmon fishing")) return "Fishing";
  if (text.includes("glacier") || text.includes("hike") || text.includes("trek") || text.includes("walk")) return "Hiking & Glaciers";
  return "Adventures";
}

function isPublicExcursion(pk: number, title: string, company: string, port: string) {
  if (!pk || !title || !company || !port) return false;
  if (!new Set(["juneau", "skagway", "ketchikan"]).has(port)) return false;
  if (BLOCKED_ITEM_IDS.has(pk)) return false;
  if (BLOCKED_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return false;
  return true;
}

function extractDollarAmount(text: string | null | undefined) {
  const match = String(text || "").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const dollars = Number(String(match[1]).replace(/,/g, ""));
  return Number.isFinite(dollars) && dollars > 0 ? dollars : null;
}

function getNorthstarDisplayPrice(tour: Pick<HelicopterTour, "company" | "description">) {
  if (tour.company !== "northstartrekking") return undefined;
  const dollars = extractDollarAmount(tour.description);
  return dollars ? `From $${dollars}` : undefined;
}

function getLowestRateCents(rates: unknown) {
  if (!Array.isArray(rates)) return undefined;
  const values = rates
    .map((rate) => {
      const row = rate as { customer_prototype?: { total?: number }; price?: number };
      const cents = Number(row?.customer_prototype?.total ?? row?.price ?? NaN);
      return Number.isFinite(cents) && cents > 0 ? cents : null;
    })
    .filter((value): value is number => value !== null);
  return values.length ? Math.min(...values) : undefined;
}

async function loadLiveItemDetails(company: string, item: number): Promise<{ imageGallery: string[] }> {
  if (process.env.NEXT_PHASE === "phase-production-build") return { imageGallery: [] };

  const appKey = String(process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "").trim();
  const userKey = String(process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "").trim();
  if (!appKey || !userKey || !company || !item) return { imageGallery: [] };

  try {
    const res = await fetch(
      `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}/items/${encodeURIComponent(String(item))}/`,
      {
        headers: {
          "X-FareHarbor-API-App": appKey,
          "X-FareHarbor-API-User": userKey,
          Accept: "application/json",
          "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
        },
        next: { revalidate: 86400 },
      },
    );
    if (!res.ok) return { imageGallery: [] };
    const data = await res.json();
    const itemData = data?.item || data;
    const imageGallery: string[] = Array.isArray(itemData?.images)
      ? itemData.images
          .map((image: { image_cdn_url?: string }) => String(image?.image_cdn_url || "").trim())
          .filter(Boolean)
      : [];
    return { imageGallery: Array.from(new Set(imageGallery)) };
  } catch {
    return { imageGallery: [] };
  }
}

function getLiveItemDetails(company: string, item: number) {
  return unstable_cache(
    async () => loadLiveItemDetails(company, item),
    ["fh-item-details", company, String(item)],
    { revalidate: 86400 },
  )();
}

function normalizeTour(
  tour: SnapshotTour | FareHarborTour,
  fallbackCompany?: string,
): HelicopterTour | null {
  const snapshotTour = tour as SnapshotTour;
  const fareHarborTour = tour as FareHarborTour;
  const company = String(
    fareHarborTour.fareharbor?.company ||
      snapshotTour.fareharbor?.company ||
      snapshotTour.company ||
      fallbackCompany ||
      "",
  ).trim().toLowerCase();

  const pk = Number(
    fareHarborTour.fareharbor?.itemPk ||
      snapshotTour.fareharbor?.itemPk ||
      tour.pk ||
      0,
  );

  const title = String(tour.title || "").trim();
  const description = String(
    snapshotTour.shortDescription || snapshotTour.headline || tour.description || "",
  ).trim();
  const slugSource = String(tour.slug || title || "").trim();
  const slug = slugSource ? slugify(slugSource) : "";
  const port = inferPortFromCompany(company, pk) || "";

  if (!isPublicExcursion(pk, title, company, port)) return null;

  return {
    pk,
    slug,
    title,
    description: cleanTourDescription(description) || undefined,
    image: tour.image || undefined,
    imageGallery: tour.image ? [tour.image] : [],
    company,
    port,
    fromPrice: snapshotTour.fromPrice || fareHarborTour.fromPrice || undefined,
    category: inferCategory(title, description, snapshotTour.category),
    hasInventory: null,
  };
}

async function loadSnapshotTours(): Promise<HelicopterTour[]> {
  const candidateFiles = [
    path.join(process.cwd(), "public", "data", "tours.json"),
    path.join(process.cwd(), "public", "data", "widget-tours.json"),
  ];

  for (const file of candidateFiles) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const tours = JSON.parse(raw) as SnapshotTour[];
      const normalized = tours
        .map((tour) => normalizeTour(tour))
        .filter((tour): tour is HelicopterTour => Boolean(tour));
      if (normalized.length) return normalized;
    } catch {
      continue;
    }
  }
  return [];
}

function dedupeTours(tours: HelicopterTour[]) {
  const byKey = new Map<string, HelicopterTour>();
  for (const tour of tours) {
    const key = `${tour.company}:${tour.pk}`;
    const existing = byKey.get(key);
    if (!existing || (!existing.image && tour.image)) byKey.set(key, tour);
  }
  return Array.from(byKey.values());
}

export const getHelicopterToursSnapshot = unstable_cache(
  async (): Promise<HelicopterTour[]> => {
    const tours = await loadSnapshotTours();
    return dedupeTours(tours).sort((a, b) => {
      const portCompare = a.port.localeCompare(b.port);
      return portCompare || a.title.localeCompare(b.title);
    });
  },
  ["alaska-tours-snapshot-v3"],
  { revalidate: 1800 },
);

export const getHelicopterTours = unstable_cache(
  async (): Promise<HelicopterTour[]> => {
    // Snapshot is intentionally primary: it contains category, image and pricing data
    // without requiring dozens of item-level FareHarbor calls on each storefront request.
    const snapshotTours = await loadSnapshotTours();
    const liveTours = await getToursFromFareHarbor().catch(() => []);
    const normalizedLiveTours = liveTours
      .map((tour) => normalizeTour(tour))
      .filter((tour): tour is HelicopterTour => Boolean(tour));

    const snapshotByKey = new Map(snapshotTours.map((tour) => [`${tour.company}:${tour.pk}`, tour]));
    const merged = normalizedLiveTours.map((tour) => {
      const snapshot = snapshotByKey.get(`${tour.company}:${tour.pk}`);
      return {
        ...tour,
        description: snapshot?.description || tour.description,
        image: snapshot?.image || tour.image,
        imageGallery: snapshot?.imageGallery || tour.imageGallery,
        fromPrice: getNorthstarDisplayPrice(snapshot || tour) || snapshot?.fromPrice || tour.fromPrice,
        category: snapshot?.category || tour.category,
      };
    });

    const tours = merged.length ? [...merged, ...snapshotTours] : snapshotTours;
    return dedupeTours(tours).sort((a, b) => {
      const portCompare = a.port.localeCompare(b.port);
      return portCompare || a.title.localeCompare(b.title);
    });
  },
  ["alaska-tours-v3"],
  { revalidate: 1800 },
);

export async function getHelicopterTour(company: string, item: string): Promise<HelicopterTour | null> {
  const tours = await getHelicopterTours();
  const normalizedCompany = String(company || "").trim().toLowerCase();
  const normalizedItem = String(item || "").trim().toLowerCase();
  const found = tours.find(
    (tour) =>
      tour.company === normalizedCompany &&
      (String(tour.pk) === normalizedItem || tour.slug === normalizedItem),
  ) || null;
  if (!found) return null;

  const details = await getLiveItemDetails(found.company, found.pk);
  const imageGallery = details.imageGallery.length
    ? details.imageGallery
    : found.image
      ? [found.image]
      : [];

  return { ...found, imageGallery, image: imageGallery[0] || found.image };
}

export async function getHelicopterTourDeparturesForDate(
  date: string,
): Promise<HelicopterTourDeparture[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const tours = await getHelicopterTours();
  const departures = await Promise.all(
    tours.map(async (tour) => {
      const availabilities = await getFareHarborAvailabilities(
        tour.company,
        String(tour.pk),
        date,
        date,
      ).catch(() => []);

      return availabilities
        .filter((availability: any) => {
          const startAt = String(
            availability?.start_at ?? availability?.startAt ?? availability?.start ?? "",
          );
          return startAt.slice(0, 10) === date;
        })
        .map((availability: any) => ({
          company: tour.company,
          itemPk: tour.pk,
          slug: tour.slug,
          title: tour.title,
          description: tour.description,
          image: tour.image,
          category: tour.category,
          fromPrice: tour.fromPrice,
          availabilityPk: Number(availability?.pk ?? availability?.availability_pk ?? 0),
          startAt: String(
            availability?.start_at ?? availability?.startAt ?? availability?.start ?? "",
          ),
          capacity: typeof availability?.capacity === "number" ? availability.capacity : null,
          priceCents: getLowestRateCents(availability?.customer_type_rates),
        }))
        .filter(
          (departure: HelicopterTourDeparture) =>
            departure.availabilityPk > 0 && departure.startAt.length >= 16,
        );
    }),
  );

  return departures.flat().sort((a, b) => {
    const startCompare = a.startAt.localeCompare(b.startAt);
    if (startCompare !== 0) return startCompare;
    const companyCompare = a.company.localeCompare(b.company);
    if (companyCompare !== 0) return companyCompare;
    return a.title.localeCompare(b.title);
  });
}

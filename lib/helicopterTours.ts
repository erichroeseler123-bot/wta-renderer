import path from "path";
import { promises as fs } from "fs";
import { unstable_cache } from "next/cache";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { getToursFromFareHarbor, type Tour as FareHarborTour } from "@/lib/data/tours";
import { getFareHarborAvailabilities } from "@/lib/fareharborAvailability";
import { cleanTourDescription } from "@/lib/tourSeo";
import { getVisibility } from "@/lib/visibilityStore";

export type HelicopterTour = {
  pk: number;
  slug: string;
  title: string;
  description?: string;
  duration?: string;
  image?: string;
  imageGallery?: string[];
  company: string;
  port: string;
  fromPrice?: string;
  priceUpdatedAt?: string | number | null;
  category?: string;
  nextAvailableDate?: string;
  hasInventory?: boolean | null;
  cancellationPolicy?: string;
};

export type WidgetTourState = {
  status: "active" | "retired" | "not_found";
  tour: HelicopterTour | null;
  reason?: string;
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
  duration?: string;
  image?: string;
  company?: string;
  fromPrice?: string;
  priceUpdatedAt?: string | number | null;
  updatedAt?: string;
  category?: string;
  retired?: boolean;
  status?: string;
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
  589694, // Harley Davidson Rentals
  15907, // Three Hour Scooter Rentals
  439402, // Five Hour Scooter Rentals
  522188, // KLR650
  523466, // Honda Shadow
  311577, // Boat Rentals
  363065, // Boat Rentals
  363066, // Boat Rentals
  724815, // Boat Rentals
  4162, // Gift Certificate
  115876, // NorthStar Gift Card
  210486, // BeyondAK Gift Card
  214000, // Temsco Summercamp Gift Card
  214814, // Temsco Air Juneau Gift Card
  223870, // Moore Charters Gift Card
  225574, // Kayak Ketchikan Gift Card
  229563, // Alaska Rainforest Gift Cards
  238867, // Skagway Scooters Gift Card
  356274, // Ketchikan AdventureVue Gift Card
  392963, // Taquan Air Gift Card
  500992, // Alaska Galore Gift Card
]);

const BLOCKED_TITLE_PATTERNS = [
  /\bgift\s*(card|certificate)\b/i,
  /\bvoucher\b/i,
  /\blocal\s+membership\b/i,
  /\bmembership\s+rate\b/i,
  /\bdock\s+sales\b/i,
  /\bwater\s+taxi\b/i,
  /\btransfer\b/i,
  /\bfundrais/i,
  /\blocal'?s\s+day\b/i,
  /\bboat\s+rentals?\b/i,
  /\bharley\s+davidson\s+rentals?\b/i,
  /\bscooter\s+rentals?\b/i,
  /\brentals?\b/i,
  /^klr650$/i,
  /^honda\s+shadow$/i,
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function inferCategory(title: string, description: string, explicit?: string, port?: string) {
  if (port === "ketchikan" && explicit === "Hiking & Glaciers") return "Adventures";
  if (explicit && explicit !== "Hiking & Glaciers") return explicit;
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("summer camp") || text.includes("wheeled cart")) return "Dog Sledding";
  if (text.includes("whale")) return "Whale Watching";
  if (text.includes("dog") || text.includes("sled") || text.includes("husky")) return "Dog Sledding";
  if (text.includes("helicopter") || text.includes("flightseeing") || text.includes("seaplane") || text.includes("floatplane") || text.includes("flight")) return "Air Tours";
  if (text.includes("fish") || text.includes("halibut") || text.includes("salmon fishing")) return "Fishing";
  if (port !== "ketchikan" && (text.includes("glacier") || text.includes("icefield") || text.includes("trek") || (text.includes("hike") && !text.includes("boardwalk")))) return "Hiking & Glaciers";
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

function getNorthstarDisplayPrice(tour: Pick<HelicopterTour, "company" | "description"> & { pk?: number }) {
  if (tour.company !== "northstartrekking") return undefined;
  if (tour.pk === 405050) return "$419 Per Person (Flat Rate)";
  const dollars = extractDollarAmount(tour.description);
  return dollars ? `$${dollars} Per Person (Flat Rate)` : undefined;
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

async function loadLiveItemDetails(company: string, item: number): Promise<{ imageGallery: string[]; cancellationPolicy?: string }> {
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
    const cancellationPolicy = itemData?.cancellation_policy
      ? String(itemData.cancellation_policy).trim()
      : undefined;
    return {
      imageGallery: Array.from(new Set(imageGallery)),
      cancellationPolicy,
    };
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
  options?: { allowBlockedOrRetired?: boolean; defaultPriceUpdatedAt?: string },
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
  let description = String(
    snapshotTour.shortDescription || snapshotTour.headline || tour.description || "",
  ).trim();

  if (company === "northstartrekking" && pk === 405050) {
    description = description
      .replace(/\$405\s*(?:Per\s*Person)?/gi, "$419 Per Person (Flat Rate)")
      .replace(/\$388\s*(?:Per\s*Person)?/gi, "$419 Per Person (Flat Rate)");
  } else if (company === "temscoair-skagway" && pk === 213556) {
    description = "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk";
  } else if (company === "temscoair-skagway" && pk === 213561) {
    description = "$599 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Dog Sledding Demonstration (No Riding)";
  } else if (company === "akduck" && pk === 4161) {
    description = "90 Minutes • All Ages • Historic downtown Ketchikan & scenic harbor splash";
  } else if (company === "alaskarainforest" && pk === 563489) {
    description = "3.5 Hours • All Ages (Brewery 21+) • Rainforest boardwalk bear viewing & craft brewery tasting";
  } else if (company === "taquanair" && pk === 392949) {
    description = "Floatplane Flightseeing • 2 Hours • All Ages • Remote fjord water landing";
  } else if (company === "taquanair" && pk === 392950) {
    description = "Floatplane Bear Viewing • 3 Hours 15 Minutes • All Ages • Traitors Cove / Neets Bay";
  } else if (company === "skagwayscooters" && pk === 13748) {
    description = "2 Hours • Ages 18+ to drive (valid driver's license required) • Guided Skagway & Dyea scooter tour on Honda Ruckus";
  }

  const slugSource = String(tour.slug || title || "").trim();
  const slug = slugSource ? slugify(slugSource) : "";
  const port = inferPortFromCompany(company, pk) || "";

  if (!options?.allowBlockedOrRetired) {
    if (snapshotTour.retired === true || String(snapshotTour.status || "").toLowerCase() === "retired") {
      return null;
    }
    if (!isPublicExcursion(pk, title, company, port)) return null;
  } else if (!pk || !title || !company) {
    return null;
  }

  let resolvedFromPrice =
    company === "temscoair-juneau" && pk === 285755
      ? "Contact for pricing"
      : company === "northstartrekking" && pk === 405050
        ? "$419 Per Person (Flat Rate)"
        : company === "temscoair-skagway" && pk === 213556
          ? "$439 Per Person (Flat Rate)"
          : company === "temscoair-skagway" && pk === 213561
            ? "$599 Per Person (Flat Rate)"
            : company === "akduck" && pk === 4161
              ? "$79 Adult / $47 Child (Flat Rate)"
              : snapshotTour.fromPrice ||
                fareHarborTour.fromPrice ||
                getNorthstarDisplayPrice({ company, description, pk }) ||
                undefined;

  if (resolvedFromPrice && resolvedFromPrice.startsWith("From ")) {
    const d = extractDollarAmount(resolvedFromPrice);
    if (d) resolvedFromPrice = `$${d.toLocaleString()} Per Person (Flat Rate)`;
  }

  const resolvedPriceUpdatedAt =
    snapshotTour.priceUpdatedAt !== undefined
      ? snapshotTour.priceUpdatedAt
      : snapshotTour.updatedAt || options?.defaultPriceUpdatedAt || undefined;

  return {
    pk,
    slug,
    title,
    description: cleanTourDescription(description) || undefined,
    duration: snapshotTour.duration ? String(snapshotTour.duration).trim() : undefined,
    image: tour.image || undefined,
    imageGallery: tour.image ? [tour.image] : [],
    company,
    port: port || "juneau",
    fromPrice: resolvedFromPrice,
    priceUpdatedAt: resolvedPriceUpdatedAt,
    category: inferCategory(title, description, snapshotTour.category, port),
    hasInventory: null,
  };
}

let rawSnapshotCache: {
  file: string;
  mtimeMs: number;
  mtimeIso: string;
  records: SnapshotTour[];
} | null = null;

async function loadRawSnapshotWithMeta(): Promise<{
  records: SnapshotTour[];
  mtimeIso: string;
}> {
  const candidateFiles = [
    path.join(process.cwd(), "public", "data", "tours.json"),
    path.join(process.cwd(), "public", "data", "widget-tours.json"),
  ];

  for (const file of candidateFiles) {
    try {
      const stat = await fs.stat(file);
      if (
        rawSnapshotCache &&
        rawSnapshotCache.file === file &&
        rawSnapshotCache.mtimeMs === stat.mtimeMs
      ) {
        return {
          records: rawSnapshotCache.records,
          mtimeIso: rawSnapshotCache.mtimeIso,
        };
      }
      const raw = await fs.readFile(file, "utf8");
      const records = JSON.parse(raw) as SnapshotTour[];
      if (Array.isArray(records) && records.length) {
        const mtimeIso = new Date(stat.mtimeMs).toISOString();
        rawSnapshotCache = { file, mtimeMs: stat.mtimeMs, mtimeIso, records };
        return { records, mtimeIso };
      }
    } catch {
      continue;
    }
  }
  return { records: [], mtimeIso: new Date().toISOString() };
}

async function loadSnapshotTours(): Promise<HelicopterTour[]> {
  const { records, mtimeIso } = await loadRawSnapshotWithMeta();
  return records
    .map((tour) => normalizeTour(tour, undefined, { defaultPriceUpdatedAt: mtimeIso }))
    .filter((tour): tour is HelicopterTour => Boolean(tour));
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

function applyRuntimeCatalogOverride(
  tour: HelicopterTour,
  override?: {
    title?: string;
    fromPrice?: string;
    priceUpdatedAt?: string | null;
    description?: string;
    duration?: string;
    retired?: boolean;
  },
): HelicopterTour {
  if (!override) return tour;
  return {
    ...tour,
    title: typeof override.title === "string" && override.title ? override.title : tour.title,
    fromPrice:
      typeof override.fromPrice === "string" ? override.fromPrice : tour.fromPrice,
    priceUpdatedAt:
      override.priceUpdatedAt !== undefined ? override.priceUpdatedAt : tour.priceUpdatedAt,
    description:
      typeof override.description === "string" ? override.description : tour.description,
    duration:
      typeof override.duration === "string" ? override.duration : tour.duration,
  };
}

async function filterVisibleTours(tours: HelicopterTour[]): Promise<HelicopterTour[]> {
  const visibility = await getVisibility();
  const visible: HelicopterTour[] = [];
  for (const tour of tours) {
    const key = `${tour.company}:${tour.pk}`;
    if (visibility.providers[tour.company]) continue;
    if (visibility.tours[key]) continue;
    const override = visibility.overrides?.[key];
    if (override?.retired === true) continue;
    visible.push(applyRuntimeCatalogOverride(tour, override));
  }
  return visible;
}

async function computeToursSnapshot(): Promise<HelicopterTour[]> {
  const tours = await loadSnapshotTours();
  return dedupeTours(tours).sort((a, b) => {
    const portCompare = a.port.localeCompare(b.port);
    return portCompare || a.title.localeCompare(b.title);
  });
}

const cachedToursSnapshot = unstable_cache(
  computeToursSnapshot,
  ["alaska-tours-snapshot-v6"],
  { revalidate: 1800 },
);

export async function getHelicopterToursSnapshot(): Promise<HelicopterTour[]> {
  let tours: HelicopterTour[];
  try {
    tours = await cachedToursSnapshot();
  } catch {
    tours = await computeToursSnapshot();
  }
  return filterVisibleTours(tours);
}

async function computeAllTours(): Promise<HelicopterTour[]> {
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
      duration: snapshot?.duration || tour.duration,
      image: snapshot?.image || tour.image,
      imageGallery: snapshot?.imageGallery || tour.imageGallery,
      fromPrice: getNorthstarDisplayPrice(snapshot || tour) || snapshot?.fromPrice || tour.fromPrice,
      priceUpdatedAt: snapshot?.priceUpdatedAt || tour.priceUpdatedAt,
      category: snapshot?.category || tour.category,
    };
  });

  const tours = merged.length ? [...merged, ...snapshotTours] : snapshotTours;
  return dedupeTours(tours).sort((a, b) => {
    const portCompare = a.port.localeCompare(b.port);
    return portCompare || a.title.localeCompare(b.title);
  });
}

const cachedAllTours = unstable_cache(
  computeAllTours,
  ["alaska-tours-v6"],
  { revalidate: 1800 },
);

export async function getHelicopterTours(): Promise<HelicopterTour[]> {
  // Always read fresh mtime-checked snapshot + visibility so local catalog updates
  // and admin visibility changes flow through immediately.
  const snapshotTours = await loadSnapshotTours();
  let cached: HelicopterTour[] = [];
  try {
    cached = await cachedAllTours();
  } catch {
    cached = snapshotTours;
  }

  const snapshotByKey = new Map(snapshotTours.map((tour) => [`${tour.company}:${tour.pk}`, tour]));
  const merged = cached.map((tour) => {
    const latestSnapshot = snapshotByKey.get(`${tour.company}:${tour.pk}`);
    return latestSnapshot ? { ...tour, ...latestSnapshot } : tour;
  });

  const combined = dedupeTours([...snapshotTours, ...merged]).sort((a, b) => {
    const portCompare = a.port.localeCompare(b.port);
    return portCompare || a.title.localeCompare(b.title);
  });

  return filterVisibleTours(combined);
}

function applyTourSpecificOverrides(found: HelicopterTour): HelicopterTour {
  const copy = { ...found };
  if (copy.company === "northstartrekking" && (Number(copy.pk) === 405050 || String(copy.pk) === "405050")) {
    copy.fromPrice = "$419 Per Person (Flat Rate)";
    copy.description = (copy.description || "")
      .replace(/\$388\s*(?:Per\s*Person)?/gi, "$419 Per Person (Flat Rate)")
      .replace(/\$405\s*(?:Per\s*Person)?/gi, "$419 Per Person (Flat Rate)");
  } else if (copy.company === "temscoair-skagway" && (Number(copy.pk) === 213556 || String(copy.pk) === "213556")) {
    copy.fromPrice = "$439 Per Person (Flat Rate)";
    copy.description = "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk";
  } else if (copy.company === "temscoair-skagway" && (Number(copy.pk) === 213561 || String(copy.pk) === "213561")) {
    copy.fromPrice = "$599 Per Person (Flat Rate)";
    copy.description = "$599 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Dog Sledding Demonstration (No Sled Riding)";
  } else if (copy.company === "akduck" && (Number(copy.pk) === 4161 || String(copy.pk) === "4161")) {
    copy.fromPrice = "$79 Adult / $47 Child (Flat Rate)";
    copy.description = "90 Minutes • All Ages • Historic downtown Ketchikan & scenic harbor splash";
    copy.category = "Adventures";
  } else if (copy.company === "alaskarainforest" && (Number(copy.pk) === 563489 || String(copy.pk) === "563489")) {
    copy.description = "3.5 Hours • All Ages (Brewery 21+) • Rainforest boardwalk bear viewing & craft brewery tasting";
    copy.category = "Adventures";
  } else if (copy.company === "taquanair" && (Number(copy.pk) === 392949 || String(copy.pk) === "392949")) {
    copy.fromPrice = "$369 Per Person (Flat Rate)";
    copy.description = "Floatplane Flightseeing • 2 Hours • All Ages • Remote fjord water landing";
    copy.category = "Air Tours";
  } else if (copy.company === "taquanair" && (Number(copy.pk) === 392950 || String(copy.pk) === "392950")) {
    copy.fromPrice = "$399 Per Person (Flat Rate)";
    copy.description = "Floatplane Bear Viewing • 3 Hours 15 Minutes • All Ages • Traitors Cove / Neets Bay";
    copy.category = "Air Tours";
  }
  return copy;
}

/**
 * Resolves a tour for the embeddable widget renderer using cached catalog data only.
 * Never triggers a per-impression upstream FareHarbor API call, and clearly distinguishes
 * active tours from retired/hidden tours and non-existent tours.
 */
export async function getWidgetTourState(company: string, item: string): Promise<WidgetTourState> {
  const normalizedCompany = String(company || "").trim().toLowerCase();
  const normalizedItem = String(item || "").trim().toLowerCase();

  if (!normalizedCompany || !normalizedItem) {
    return {
      status: "not_found",
      tour: null,
      reason: "No tour identifier was provided for this widget.",
    };
  }

  const [{ records: rawRecords, mtimeIso }, visibility] = await Promise.all([
    loadRawSnapshotWithMeta(),
    getVisibility(),
  ]);

  const matchedRaw = rawRecords.find((record) => {
    const recCompany = String(record.fareharbor?.company || record.company || "").trim().toLowerCase();
    if (recCompany !== normalizedCompany) return false;
    const recPk = String(record.fareharbor?.itemPk || record.pk || "").trim().toLowerCase();
    const recSlug = slugify(String(record.slug || record.title || ""));
    return recPk === normalizedItem || (recSlug && recSlug === normalizedItem);
  });

  if (matchedRaw) {
    const permissiveTour = normalizeTour(matchedRaw, normalizedCompany, {
      allowBlockedOrRetired: true,
      defaultPriceUpdatedAt: mtimeIso,
    });
    const strictTour = normalizeTour(matchedRaw, normalizedCompany, {
      allowBlockedOrRetired: false,
      defaultPriceUpdatedAt: mtimeIso,
    });
    const resolvedPk = permissiveTour?.pk || Number(matchedRaw.pk || 0);
    const key = `${normalizedCompany}:${resolvedPk}`;
    const runtimeOverride = visibility.overrides?.[key];
    const isHidden =
      Boolean(visibility.providers[normalizedCompany]) ||
      Boolean(visibility.tours[key]);
    const isExplicitlyRetired =
      matchedRaw.retired === true ||
      String(matchedRaw.status || "").toLowerCase() === "retired" ||
      runtimeOverride?.retired === true;

    if (!strictTour || isHidden || isExplicitlyRetired) {
      const baseRetiredTour = permissiveTour ? applyTourSpecificOverrides(permissiveTour) : null;
      return {
        status: "retired",
        tour: baseRetiredTour ? applyRuntimeCatalogOverride(baseRetiredTour, runtimeOverride) : null,
        reason: "This excursion is currently retired or unavailable for online booking.",
      };
    }

    const activeTour = applyRuntimeCatalogOverride(
      applyTourSpecificOverrides(strictTour),
      runtimeOverride,
    );

    return {
      status: "active",
      tour: activeTour,
    };
  }

  // Check if this company/item is marked hidden/retired in visibility.json even if removed from tours.json
  const numericItem = Number(normalizedItem);
  if (
    visibility.providers[normalizedCompany] ||
    visibility.tours[`${normalizedCompany}:${normalizedItem}`] ||
    visibility.overrides?.[`${normalizedCompany}:${normalizedItem}`]?.retired === true ||
    (Number.isFinite(numericItem) && BLOCKED_ITEM_IDS.has(numericItem)) ||
    normalizedItem.includes("retired")
  ) {
    return {
      status: "retired",
      tour: null,
      reason: "This excursion has been retired and is no longer available for booking.",
    };
  }

  return {
    status: "not_found",
    tour: null,
    reason: "This tour is not available in the Welcome to Alaska Tours catalog.",
  };
}

export async function getHelicopterTour(company: string, item: string): Promise<HelicopterTour | null> {
  const tours = await getHelicopterTours();
  const normalizedCompany = String(company || "").trim().toLowerCase();
  const normalizedItem = String(item || "").trim().toLowerCase();
  const found =
    tours.find(
      (tour) =>
        tour.company === normalizedCompany &&
        (String(tour.pk) === normalizedItem || tour.slug === normalizedItem),
    ) || null;
  if (!found) return null;

  const overridden = applyTourSpecificOverrides(found);
  let details: { imageGallery: string[]; cancellationPolicy?: string } = { imageGallery: [] };
  try {
    details = await getLiveItemDetails(overridden.company, overridden.pk);
  } catch {
    details = { imageGallery: [] };
  }
  const imageGallery = details.imageGallery.length
    ? details.imageGallery
    : overridden.image
      ? [overridden.image]
      : [];

  return {
    ...overridden,
    imageGallery,
    image: imageGallery[0] || overridden.image,
    cancellationPolicy: details.cancellationPolicy,
  };
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

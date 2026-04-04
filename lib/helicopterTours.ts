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

const HELICOPTER_COMPANIES = new Set([
  "coastalhelicopters",
  "northstartrekking",
  "temscoair-juneau",
  "temsco-summercamp-juneau",
]);

const ALLOWED_WIDGET_ITEMS = new Map<string, Set<number>>([
  ["coastalhelicopters", new Set([413056, 413073, 413093])],
  ["northstartrekking", new Set([115991, 116029, 116035, 116037, 405050, 645179])],
  ["temscoair-juneau", new Set([214803, 214807, 214810])],
  ["temsco-summercamp-juneau", new Set([213994])],
]);

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatFromPrice(cents: number | null) {
  if (!cents || cents <= 0) return undefined;
  return `From $${Math.floor(cents / 100)}`;
}

function formatNextAvailableDate(startAt: string | null) {
  if (!startAt) return undefined;
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Anchorage",
  });
}

function getLowestRateCents(rates: unknown) {
  if (!Array.isArray(rates)) return undefined;

  const values = rates
    .map((rate) => {
      const row = rate as {
        customer_prototype?: { total?: number };
        price?: number;
      };
      const cents = Number(row?.customer_prototype?.total ?? row?.price ?? NaN);
      return Number.isFinite(cents) && cents > 0 ? cents : null;
    })
    .filter((value): value is number => value !== null);

  return values.length ? Math.min(...values) : undefined;
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

async function loadLiveAvailabilitySummary(company: string, item: number) {
  const appKey = String(process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "").trim();
  const userKey = String(process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "").trim();

  if (!appKey || !userKey || !company || !item) {
    return { fromPrice: undefined, nextAvailableDate: undefined, hasInventory: null as boolean | null };
  }

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 95);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  try {
    const url =
      `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}` +
      `/items/${encodeURIComponent(String(item))}` +
      `/minimal/availabilities/date-range/${encodeURIComponent(fmt(start))}/${encodeURIComponent(fmt(end))}/` +
      `?api-user=${encodeURIComponent(userKey)}`;

    const res = await fetch(url, {
      headers: {
        "X-FareHarbor-API-App": appKey,
        "X-FareHarbor-API-User": userKey,
        Accept: "application/json",
        "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return { fromPrice: undefined, nextAvailableDate: undefined, hasInventory: null as boolean | null };
    }

    const data = await res.json();
    const avails = Array.isArray(data?.availabilities) ? data.availabilities : [];
    let minCents: number | null = null;
    let nextStartAt: string | null = null;

    for (const availability of avails) {
      const startAt = String(availability?.start_at ?? "");
      if (startAt && (!nextStartAt || startAt < nextStartAt)) {
        nextStartAt = startAt;
      }

      const rates = Array.isArray(availability?.customer_type_rates)
        ? availability.customer_type_rates
        : [];
      for (const rate of rates) {
        const cents = rate?.customer_prototype?.total;
        if (typeof cents === "number" && cents > 0) {
          if (minCents === null || cents < minCents) minCents = cents;
        }
      }
    }

    return {
      fromPrice: formatFromPrice(minCents),
      nextAvailableDate: formatNextAvailableDate(nextStartAt),
      hasInventory: avails.length > 0,
    };
  } catch {
    return { fromPrice: undefined, nextAvailableDate: undefined, hasInventory: null as boolean | null };
  }
}

function getLiveAvailabilitySummary(company: string, item: number) {
  return unstable_cache(
    async () => loadLiveAvailabilitySummary(company, item),
    ["fh-availability-summary", company, String(item)],
    { revalidate: 1800 },
  )();
}

async function loadLiveItemDetails(company: string, item: number): Promise<{ imageGallery: string[] }> {
  const appKey = String(process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "").trim();
  const userKey = String(process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "").trim();

  if (!appKey || !userKey || !company || !item) {
    return { imageGallery: [] as string[] };
  }

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

    if (!res.ok) return { imageGallery: [] as string[] };

    const data = await res.json();
    const itemData = data?.item || data;
    const imageGallery: string[] = Array.isArray(itemData?.images)
      ? itemData.images
          .map((image: { image_cdn_url?: string }) => String(image?.image_cdn_url || "").trim())
          .filter((image: string) => Boolean(image))
      : [];

    return {
      imageGallery: Array.from(new Set(imageGallery)),
    };
  } catch {
    return { imageGallery: [] as string[] };
  }
}

function getLiveItemDetails(company: string, item: number) {
  return unstable_cache(
    async (): Promise<{ imageGallery: string[] }> => loadLiveItemDetails(company, item),
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
  )
    .trim()
    .toLowerCase();

  const pk = Number(
    fareHarborTour.fareharbor?.itemPk ||
      snapshotTour.fareharbor?.itemPk ||
      tour.pk ||
      0,
  );

  const title = String(tour.title || "").trim();
  const description = String(
    snapshotTour.shortDescription ||
      snapshotTour.headline ||
      tour.description ||
      "",
  ).trim();
  const slugSource = String(tour.slug || title || "").trim();
  const slug = slugSource ? slugify(slugSource) : "";
  const port = inferPortFromCompany(company) || "";
  const allowedItems = ALLOWED_WIDGET_ITEMS.get(company);

  if (!company || !HELICOPTER_COMPANIES.has(company)) return null;
  if (!pk || !title || port !== "juneau") return null;
  if (!allowedItems?.has(pk)) return null;

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
    category: snapshotTour.category || undefined,
  };
}

async function loadSnapshotTours(): Promise<HelicopterTour[]> {
  const candidateFiles = [
    path.join(process.cwd(), "public", "data", "widget-tours.json"),
    path.join(process.cwd(), "public", "data", "tours.json"),
  ];

  for (const file of candidateFiles) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const tours = JSON.parse(raw) as SnapshotTour[];
      return tours
        .map((tour) => normalizeTour(tour))
        .filter((tour): tour is HelicopterTour => Boolean(tour));
    } catch {
      continue;
    }
  }

  return [];
}

export const getHelicopterToursSnapshot = unstable_cache(
  async (): Promise<HelicopterTour[]> => {
    const tours = await loadSnapshotTours();

    return tours.sort((a, b) => a.title.localeCompare(b.title));
  },
  ["helicopter-tours-snapshot"],
  { revalidate: 1800 },
);

export const getHelicopterTours = unstable_cache(
  async (): Promise<HelicopterTour[]> => {
    const liveTours = await getToursFromFareHarbor().catch(() => []);
    const normalizedLiveTours = liveTours
      .map((tour) => normalizeTour(tour))
      .filter((tour): tour is HelicopterTour => Boolean(tour));

    const tours = normalizedLiveTours.length > 0 ? normalizedLiveTours : await loadSnapshotTours();

    const enrichedTours = await Promise.all(
      tours.map(async (tour) => {
        const summary = await getLiveAvailabilitySummary(tour.company, tour.pk);
        const northstarDisplayPrice = getNorthstarDisplayPrice(tour);
        return {
          ...tour,
          fromPrice: northstarDisplayPrice || summary.fromPrice || tour.fromPrice,
          nextAvailableDate: summary.nextAvailableDate,
          hasInventory: summary.hasInventory,
        };
      }),
    );

    return enrichedTours
      .filter((tour) => tour.hasInventory !== false)
      .sort((a, b) => a.title.localeCompare(b.title));
  },
  ["helicopter-tours"],
  { revalidate: 1800 },
);

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

  const details = await getLiveItemDetails(found.company, found.pk);
  const imageGallery: string[] = details.imageGallery.length
    ? details.imageGallery
    : found.image
      ? [found.image]
      : [];

  return {
    ...found,
    imageGallery,
    image: imageGallery[0] || found.image,
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
            availability?.start_at ??
              availability?.startAt ??
              availability?.start ??
              "",
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
            availability?.start_at ??
              availability?.startAt ??
              availability?.start ??
              "",
          ),
          capacity:
            typeof availability?.capacity === "number" ? availability.capacity : null,
          priceCents: getLowestRateCents(availability?.customer_type_rates),
        }))
        .filter(
          (departure: HelicopterTourDeparture) =>
            departure.availabilityPk > 0 &&
            departure.startAt.length >= 16,
        );
    }),
  );

  return departures
    .flat()
    .sort((a, b) => {
      const startCompare = a.startAt.localeCompare(b.startAt);
      if (startCompare !== 0) return startCompare;
      const companyCompare = a.company.localeCompare(b.company);
      if (companyCompare !== 0) return companyCompare;
      return a.title.localeCompare(b.title);
    });
}

// lib/data/tours.ts

export type Tour = {
  slug: string;
  title: string;
  description: string;
  duration?: string;
  fromPrice?: string;
  port?: string; // optional now (comes from FareHarbor data if you want)
  category?: string; // optional now (comes from FareHarbor data if you want)
  image?: string;
  // raw passthrough (useful during integration)
  fareharbor?: {
    itemPk: number;
    company: string;
    url?: string;
  };
};

const BASE_URL =
  process.env.FAREHARBOR_API_BASE_URL || "https://api.fareharbor.com/v1";
const APP_KEY = process.env.FAREHARBOR_APP_KEY || "";
const USER_KEY = process.env.FAREHARBOR_USER_KEY || "";
const COMPANY = process.env.FAREHARBOR_COMPANY_SHORTNAME || "";

/**
 * Minimal, safe fetch wrapper.
 * - Throws if credentials missing ONLY when called (so build won't explode by default).
 * - No caching (you can add revalidate later).
 */
async function fhFetch(path: string) {
  if (!APP_KEY || !USER_KEY || !COMPANY) {
    throw new Error(
      "Missing FareHarbor env vars. Need FAREHARBOR_APP_KEY, FAREHARBOR_USER_KEY, FAREHARBOR_COMPANY_SHORTNAME.",
    );
  }

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "X-FareHarbor-API-App": APP_KEY,
      "X-FareHarbor-API-User": USER_KEY,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `FareHarbor request failed ${res.status} ${res.statusText}: ${text.slice(0, 300)}`,
    );
  }

  return res.json();
}

/**
 * Safe conversion: FareHarbor "items" -> your "Tour".
 * NOTE: FareHarbor fields vary by account; we keep mapping conservative.
 */
function itemToTour(item: any): Tour {
  const name = item?.name || item?.title || `Item ${item?.pk ?? ""}`.trim();
  const description = (
    item?.headline ||
    item?.short_description ||
    item?.description ||
    ""
  )
    .toString()
    .trim();

  // slug: prefer api "slug", else build from name
  const slug =
    (item?.slug && String(item.slug)) ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // pricing: many FareHarbor accounts have price objects; keep it simple
  let fromPrice: string | undefined;
  const price =
    item?.price?.amount ??
    item?.price ??
    item?.base_price?.amount ??
    item?.base_price ??
    undefined;

  if (typeof price === "number") fromPrice = `From $${price}`;
  else if (typeof price === "string" && price.trim()) fromPrice = price.trim();

  // duration: often in minutes or human string depending on config
  let duration: string | undefined;
  const durMin = item?.duration_minutes ?? item?.duration ?? undefined;
  if (typeof durMin === "number")
    duration = `${Math.round((durMin / 60) * 10) / 10} Hours`;
  else if (typeof durMin === "string" && durMin.trim())
    duration = durMin.trim();

  // image: try common spots
  const image =
    item?.hero_image_url ||
    item?.image_url ||
    item?.images?.[0]?.large ||
    item?.images?.[0]?.url ||
    undefined;

  return {
    slug,
    title: name,
    description: description || "View details and availability.",
    duration,
    fromPrice,
    image,
    fareharbor: {
      itemPk: Number(item?.pk ?? item?.item_pk ?? 0),
      company: COMPANY,
      url: item?.url || item?.public_url || undefined,
    },
  };
}

/**
 * Fetch all items for the company (this is the real “inventory list” test).
 * If your account requires a different endpoint, we’ll know immediately from the error output.
 */
export async function getToursFromFareHarbor(): Promise<Tour[]> {
  // Common FareHarbor pattern (v1):
  // GET /companies/:shortname/items/
  const data = await fhFetch(
    `/companies/${encodeURIComponent(COMPANY)}/items/`,
  );

  // Different accounts return slightly different shapes.
  const items = Array.isArray(data)
    ? data
    : (data?.items ?? data?.results ?? []);
  if (!Array.isArray(items)) return [];

  return items.map(itemToTour);
}

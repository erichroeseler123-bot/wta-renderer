import { unstable_cache } from "next/cache";
import { getKV } from "@/lib/kv";
import { getPredictiveCacheTTL } from "@/lib/cache-timing";

const BASE = "https://fareharbor.com/api/external/v1";
const MAX_RANGE_DAYS = 100;
const CHUNK_DAYS = 95;

function getFareHarborCredentials() {
  const app =
    (
      process.env.FAREHARBOR_APP_KEY ??
      process.env.FH_APP_NAME ??
      process.env.FH_APP_KEY ??
      process.env.FAREHARBOR_APP ??
      process.env.FH_APP ??
      ""
    ).trim();
  const user =
    (
      process.env.FAREHARBOR_USER_KEY ??
      process.env.FH_API_KEY ??
      process.env.FH_USER_KEY ??
      process.env.FAREHARBOR_USER ??
      process.env.FH_USER ??
      ""
    ).trim();

  if (!app) throw new Error("Missing env var: FAREHARBOR_APP_KEY");
  if (!user) throw new Error("Missing env var: FAREHARBOR_USER_KEY");

  return { app, user };
}

function ymdUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseYmdUTC(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`Invalid date: ${s} (expected YYYY-MM-DD)`);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${s}`);
  return d;
}

function addDaysUTC(d: Date, days: number) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function daysBetweenInclusiveUTC(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  const aa = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bb = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((bb - aa) / ms) + 1;
}

async function fetchAvailabilityChunk(
  company: string,
  item: string,
  start: string,
  end: string,
) {
  const { app, user } = getFareHarborCredentials();
  const fhUrl =
    `${BASE}/companies/${encodeURIComponent(company)}` +
    `/items/${encodeURIComponent(item)}` +
    `/minimal/availabilities/date-range/${encodeURIComponent(start)}/${encodeURIComponent(end)}/` +
    `?api-user=${encodeURIComponent(user)}`;

  const response = await fetch(fhUrl, {
    headers: {
      "X-FareHarbor-API-App": app,
      "X-FareHarbor-API-User": user,
      Accept: "application/json",
      "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
    },
    next: { revalidate: 300 },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `FareHarbor request failed ${response.status} ${response.statusText}: ${text.slice(0, 200)}`,
    );
  }

  const data = JSON.parse(text);
  return Array.isArray(data?.availabilities) ? data.availabilities : [];
}

async function getFreshFareHarborAvailabilities(
  company: string,
  item: string,
  start: string,
  end: string,
) {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }
  const startDate = parseYmdUTC(start);
  const endDate = parseYmdUTC(end);
  const totalDays = daysBetweenInclusiveUTC(startDate, endDate);

  if (totalDays <= MAX_RANGE_DAYS) {
    return fetchAvailabilityChunk(company, item, start, end);
  }

  let merged: any[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    const chunkEnd = addDaysUTC(cursor, CHUNK_DAYS - 1);
    const actualEnd = chunkEnd > endDate ? endDate : chunkEnd;
    const chunkStart = ymdUTC(cursor);
    const chunkFinish = ymdUTC(actualEnd);
    const chunk = await fetchAvailabilityChunk(company, item, chunkStart, chunkFinish);
    merged = merged.concat(chunk);
    cursor = addDaysUTC(actualEnd, 1);
  }

  return merged;
}

const getCachedFareHarborAvailabilities = unstable_cache(
  async (company: string, item: string, start: string, end: string) => {
    return getFreshFareHarborAvailabilities(company, item, start, end);
  },
  ["fareharbor-availabilities"],
  { revalidate: 300 },
);

export async function getFareHarborAvailabilities(
  company: string,
  item: string,
  start: string,
  end: string,
) {
  const kv = await getKV();
  if (!kv) {
    return getCachedFareHarborAvailabilities(company, item, start, end);
  }

  const cacheKey = `fareharbor:availabilities:${company}:${item}:${start}:${end}`;
  try {
    const cached = await kv.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (e) {
    console.error("Failed to read from KV cache", e);
  }

  const data = await getFreshFareHarborAvailabilities(company, item, start, end);

  try {
    const ttl = getPredictiveCacheTTL(start);
    await kv.set(cacheKey, data, { ex: ttl });
  } catch (e) {
    console.error("Failed to write to KV cache", e);
  }

  return data;
}

export async function getFareHarborNextAvailability(
  company: string,
  item: string,
) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 90);

  const availabilities = await getFareHarborAvailabilities(
    company,
    item,
    ymdUTC(start),
    ymdUTC(end),
  );

  let best: string | null = null;
  for (const availability of availabilities) {
    const startAt =
      availability?.startAt ??
      availability?.start_at ??
      availability?.start ??
      availability?.availability?.startAt ??
      null;

    if (typeof startAt === "string" && startAt.length >= 10) {
      if (!best || startAt < best) best = startAt;
    }
  }

  return best;
}

export type ExactDeparturePriceRequest = {
  company: string;
  itemPk: number | string;
  availabilityPk: number;
  customerTypeRatePk: number;
  date?: string | null;
  startAt?: string | null;
  qty?: number;
  expectedUnitCents?: number | null;
};

export type ExactDeparturePriceSuccess = {
  ok: true;
  company: string;
  itemPk: number;
  availabilityPk: number;
  customerTypeRatePk: number;
  date: string;
  startAt: string;
  qty: number;
  unitCents: number;
  lineTotalCents: number;
  currency: "usd";
  capacity: number | null;
  expectedUnitCents: number | null;
  priceChanged: boolean;
  exactRateMatched: true;
};

export type ExactDeparturePriceFailure = {
  ok: false;
  status: number;
  code:
    | "missing_parameters"
    | "missing_departure_date"
    | "invalid_departure_date"
    | "product_mismatch"
    | "departure_mismatch"
    | "date_mismatch"
    | "rate_mismatch"
    | "departure_sold_out"
    | "insufficient_capacity"
    | "invalid_rate_price"
    | "upstream_error";
  error: string;
};

export type ExactDeparturePriceResult =
  | ExactDeparturePriceSuccess
  | ExactDeparturePriceFailure;

export type FareHarborDateFetchFn = (args: {
  company: string;
  itemPk: number;
  date: string;
}) => Promise<{ status: number; ok: boolean; bodyText: string }>;

let fareHarborDateFetchOverride: FareHarborDateFetchFn | null = null;

export function setFareHarborDateFetchForTests(fn: FareHarborDateFetchFn | null) {
  fareHarborDateFetchOverride = fn;
}

export function extractDepartureDate(
  date?: string | null,
  startAt?: string | null,
): string | null {
  const rawDate = typeof date === "string" ? date.trim() : "";
  if (rawDate) {
    const m = rawDate.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    return rawDate;
  }
  const rawStart = typeof startAt === "string" ? startAt.trim() : "";
  if (rawStart) {
    const m = rawStart.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
}

async function fetchSingleDateAvailabilitiesLive(args: {
  company: string;
  itemPk: number;
  date: string;
}): Promise<{ status: number; ok: boolean; bodyText: string }> {
  if (fareHarborDateFetchOverride) {
    return fareHarborDateFetchOverride(args);
  }

  const { app, user } = getFareHarborCredentials();
  const fhUrl =
    `${BASE}/companies/${encodeURIComponent(args.company)}` +
    `/items/${encodeURIComponent(String(args.itemPk))}` +
    `/minimal/availabilities/date/${encodeURIComponent(args.date)}/` +
    `?api-user=${encodeURIComponent(user)}`;

  const response = await fetch(fhUrl, {
    headers: {
      "X-FareHarbor-API-App": app,
      "X-FareHarbor-API-User": user,
      Accept: "application/json",
      "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
    },
    cache: "no-store",
  });

  const bodyText = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    bodyText,
  };
}

/**
 * Resolves and prices the exact selected departure directly from FareHarbor's
 * single-date availability endpoint using the departure date and provider IDs.
 * Never substitutes another departure or falls back to a cached/minimum display price.
 */
export async function resolveExactDeparturePrice(
  req: ExactDeparturePriceRequest,
): Promise<ExactDeparturePriceResult> {
  const company = String(req.company || "").trim().toLowerCase();
  const itemPk = Number(req.itemPk || 0);
  const availabilityPk = Number(req.availabilityPk || 0);
  const customerTypeRatePk = Number(req.customerTypeRatePk || 0);
  const qty = Math.max(1, Math.floor(Number(req.qty || 1)));

  if (
    !company ||
    !/^[a-z0-9_-]+$/i.test(company) ||
    !Number.isInteger(itemPk) ||
    itemPk <= 0 ||
    !Number.isInteger(availabilityPk) ||
    availabilityPk === 0 ||
    !Number.isInteger(customerTypeRatePk) ||
    customerTypeRatePk <= 0
  ) {
    return {
      ok: false,
      status: 400,
      code: "missing_parameters",
      error:
        "Missing or invalid company, item_pk, availability_pk, or customer_type_rate_pk.",
    };
  }

  const resolvedDate = extractDepartureDate(req.date, req.startAt);
  if (!resolvedDate) {
    return {
      ok: false,
      status: 400,
      code: "missing_departure_date",
      error:
        "Exact departure date (date or startAt) is required to price a selected departure.",
    };
  }

  try {
    const parsed = parseYmdUTC(resolvedDate);
    if (ymdUTC(parsed) !== resolvedDate) {
      return {
        ok: false,
        status: 400,
        code: "invalid_departure_date",
        error: `Invalid calendar date: ${resolvedDate}`,
      };
    }
  } catch {
    return {
      ok: false,
      status: 400,
      code: "invalid_departure_date",
      error: `Invalid departure date format: ${resolvedDate} (expected YYYY-MM-DD)`,
    };
  }

  let upstream: { status: number; ok: boolean; bodyText: string };
  try {
    upstream = await fetchSingleDateAvailabilitiesLive({
      company,
      itemPk,
      date: resolvedDate,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      error: err?.message || "Failed to reach FareHarbor availability service.",
    };
  }

  if (!upstream.ok) {
    if (upstream.status === 404 || upstream.status === 400) {
      return {
        ok: false,
        status: 409,
        code: "product_mismatch",
        error: `Selected product (${company}/${itemPk}) or date (${resolvedDate}) was rejected by provider.`,
      };
    }
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      error: `FareHarbor availability lookup failed (${upstream.status}).`,
    };
  }

  let payload: { availabilities?: any[] } | null = null;
  try {
    payload = JSON.parse(upstream.bodyText);
  } catch {
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      error: "Invalid JSON received from FareHarbor availability lookup.",
    };
  }

  const avails = Array.isArray(payload?.availabilities) ? payload.availabilities : [];
  const targetAvail = avails.find(
    (a) => Number(a?.pk ?? a?.availability_pk) === availabilityPk,
  );

  if (!targetAvail) {
    return {
      ok: false,
      status: 409,
      code: "departure_mismatch",
      error: `Selected departure (${availabilityPk}) was not found for ${company}/${itemPk} on ${resolvedDate}.`,
    };
  }

  if (
    targetAvail?.item?.pk !== undefined &&
    Number(targetAvail.item.pk) !== itemPk
  ) {
    return {
      ok: false,
      status: 409,
      code: "product_mismatch",
      error: `Departure ${availabilityPk} belongs to item ${targetAvail.item.pk}, not requested item ${itemPk}.`,
    };
  }

  const availStartAt = String(
    targetAvail?.start_at ?? targetAvail?.startAt ?? targetAvail?.start ?? "",
  ).trim();
  const availDatePrefix = availStartAt.slice(0, 10);
  if (availDatePrefix && availDatePrefix !== resolvedDate) {
    return {
      ok: false,
      status: 409,
      code: "date_mismatch",
      error: `Departure ${availabilityPk} starts on ${availDatePrefix}, not requested date ${resolvedDate}.`,
    };
  }

  const requestedStartAt = typeof req.startAt === "string" ? req.startAt.trim() : "";
  if (requestedStartAt && requestedStartAt.includes("T") && availStartAt) {
    const reqMs = Date.parse(requestedStartAt);
    const availMs = Date.parse(availStartAt);
    const sameInstant =
      !Number.isNaN(reqMs) && !Number.isNaN(availMs)
        ? reqMs === availMs
        : requestedStartAt === availStartAt;
    if (!sameInstant) {
      return {
        ok: false,
        status: 409,
        code: "departure_mismatch",
        error: `Selected departure time (${requestedStartAt}) does not match provider schedule (${availStartAt}).`,
      };
    }
  }

  const availCapacity =
    typeof targetAvail?.capacity === "number" && Number.isFinite(targetAvail.capacity)
      ? Math.floor(targetAvail.capacity)
      : null;

  if (availCapacity !== null && availCapacity <= 0) {
    return {
      ok: false,
      status: 409,
      code: "departure_sold_out",
      error: `Selected departure (${availabilityPk}) is sold out.`,
    };
  }

  if (availCapacity !== null && availCapacity < qty) {
    return {
      ok: false,
      status: 409,
      code: "insufficient_capacity",
      error: `Selected departure only has ${availCapacity} spot(s) remaining for requested quantity ${qty}.`,
    };
  }

  const rates = Array.isArray(targetAvail?.customer_type_rates)
    ? targetAvail.customer_type_rates
    : [];
  const targetRate = rates.find((r: any) => Number(r?.pk) === customerTypeRatePk);

  if (!targetRate) {
    return {
      ok: false,
      status: 409,
      code: "rate_mismatch",
      error: `Selected rate (${customerTypeRatePk}) is not valid for departure ${availabilityPk}.`,
    };
  }

  const rateCapacity =
    typeof targetRate?.capacity === "number" && Number.isFinite(targetRate.capacity)
      ? Math.floor(targetRate.capacity)
      : null;

  if (rateCapacity !== null && rateCapacity <= 0) {
    return {
      ok: false,
      status: 409,
      code: "departure_sold_out",
      error: `Selected customer rate (${customerTypeRatePk}) is sold out for departure ${availabilityPk}.`,
    };
  }

  if (rateCapacity !== null && rateCapacity < qty) {
    return {
      ok: false,
      status: 409,
      code: "insufficient_capacity",
      error: `Selected customer rate only has ${rateCapacity} spot(s) remaining for requested quantity ${qty}.`,
    };
  }

  const rawUnitCents = Number(targetRate?.customer_prototype?.total ?? 0);
  if (!Number.isFinite(rawUnitCents) || rawUnitCents <= 0) {
    return {
      ok: false,
      status: 409,
      code: "invalid_rate_price",
      error: `No valid live price found for departure ${availabilityPk} rate ${customerTypeRatePk}.`,
    };
  }

  const unitCents = Math.floor(rawUnitCents);
  const lineTotalCents = unitCents * qty;
  const expectedUnitCents =
    typeof req.expectedUnitCents === "number" &&
    Number.isFinite(req.expectedUnitCents) &&
    req.expectedUnitCents > 0
      ? Math.floor(req.expectedUnitCents)
      : null;
  const priceChanged =
    expectedUnitCents !== null ? expectedUnitCents !== unitCents : false;

  return {
    ok: true,
    company,
    itemPk,
    availabilityPk,
    customerTypeRatePk,
    date: resolvedDate,
    startAt: availStartAt || requestedStartAt || resolvedDate,
    qty,
    unitCents,
    lineTotalCents,
    currency: "usd",
    capacity: rateCapacity ?? availCapacity,
    expectedUnitCents,
    priceChanged,
    exactRateMatched: true,
  };
}


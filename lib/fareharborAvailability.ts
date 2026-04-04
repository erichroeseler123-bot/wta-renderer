import { unstable_cache } from "next/cache";

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

const getCachedFareHarborAvailabilities = unstable_cache(
  async (company: string, item: string, start: string, end: string) => {
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
  return getCachedFareHarborAvailabilities(company, item, start, end);
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

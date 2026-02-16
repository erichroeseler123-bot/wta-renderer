export type FHAvailability = {
  pk: number;
  start_at: string; // "2026-09-25T08:30:00-0800"
  end_at?: string;
  capacity?: number | null;
};

export type TourIntel = {
  runsTotal: number;
  seasonStart?: string;
  seasonEnd?: string;
  seasonLabel?: string; // "May 9 – Sep 25"
  lastChanceLabel?: string; // "Last chance Sep 25"
  next3: Array<{ start_at: string; capacity?: number | null }>;
};

function normalizeOffset(s: string) {
  // FH: -0800 (no colon). Make it -08:00 so Date parses reliably.
  return s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
}

function ms(startAt: string): number {
  return new Date(normalizeOffset(startAt)).getTime();
}

function fmtMonthDay(msv: number): string {
  return new Date(msv).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

async function fetchAvailabilities(
  origin: string,
  company: string,
  itemPk: number,
  start: string,
  end: string,
): Promise<FHAvailability[]> {
  const url =
    `${origin}/api/fareharbor/availabilities` +
    `?company=${encodeURIComponent(company)}` +
    `&item=${encodeURIComponent(String(itemPk))}` +
    `&start=${encodeURIComponent(start)}` +
    `&end=${encodeURIComponent(end)}`;

  const res = await fetch(url, { cache: "no-store" });
  const j = await res.json().catch(() => null);
  if (!j || !j.ok) return [];
  return (j.availabilities ?? []) as FHAvailability[];
}

export async function buildIntelMap(params: {
  origin: string;
  company: string;
  itemPks: number[];
  start: string;
  end: string;
  concurrency?: number;
}): Promise<Record<number, TourIntel>> {
  const { origin, company, itemPks, start, end } = params;
  const CONCURRENCY = clamp(params.concurrency ?? 4, 1, 8);

  const out: Record<number, TourIntel> = {};
  let idx = 0;

  async function worker() {
    while (idx < itemPks.length) {
      const i = idx++;
      const pk = itemPks[i];

      try {
        const av = await fetchAvailabilities(origin, company, pk, start, end);
        const sorted = av
          .filter((x) => typeof x?.start_at === "string")
          .slice()
          .sort((a, b) => ms(a.start_at) - ms(b.start_at));

        const runsTotal = sorted.length;

        if (!runsTotal) {
          out[pk] = { runsTotal: 0, next3: [] };
          continue;
        }

        const seasonStart = sorted[0].start_at;
        const seasonEnd = sorted[sorted.length - 1].start_at;

        const startMs = ms(seasonStart);
        const endMs = ms(seasonEnd);

        const seasonLabel = `${fmtMonthDay(startMs)} – ${fmtMonthDay(endMs)}`;
        const lastChanceLabel = `Last chance ${fmtMonthDay(endMs)}`;

        const now = Date.now();
        const next3 = sorted
          .filter((x) => ms(x.start_at) >= now)
          .slice(0, 3)
          .map((x) => ({ start_at: x.start_at, capacity: x.capacity ?? null }));

        out[pk] = {
          runsTotal,
          seasonStart,
          seasonEnd,
          seasonLabel,
          lastChanceLabel,
          next3,
        };
      } catch {
        out[pk] = { runsTotal: 0, next3: [] };
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return out;
}

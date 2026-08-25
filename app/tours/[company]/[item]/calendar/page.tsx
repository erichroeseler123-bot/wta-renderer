import Link from "next/link";
import type { Metadata } from "next";
import {
  getFareHarborAvailabilities,
  getFareHarborNextAvailability,
} from "@/lib/fareharborAvailability";
import StageTelemetry from "@/app/components/plan/StageTelemetry";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

function groupByDay(availabilities: any[]) {
  const byDay = new Map<string, any[]>();

  for (const availability of availabilities || []) {
    const startAt = String(availability?.start_at ?? availability?.startAt ?? "");
    if (startAt.length < 10) continue;
    const day = startAt.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(availability);
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, slots]) => ({
      day,
      slots: slots
        .slice()
        .sort((x, y) =>
          String(x?.start_at ?? x?.startAt ?? "").localeCompare(
            String(y?.start_at ?? y?.startAt ?? ""),
          ),
        )
        .map((slot) => ({
          pk: Number(slot?.pk ?? slot?.availability_pk ?? 0),
          start_at: slot?.start_at ?? slot?.startAt,
          startAt: slot?.startAt ?? slot?.start_at,
          capacity: slot?.capacity ?? null,
          customer_type_rates: slot?.customer_type_rates ?? [],
        })),
    }));
}

function monthRange(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const next = new Date(Date.UTC(y, m, 1));
  const end = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return { start, end };
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatWeekdayLabel(day: string) {
  const date = new Date(`${day}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ company: string; item: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { company, item } = await params;
  const sp = await searchParams;
  const getParam = (value: string | undefined) => String(value || "");
  const canonicalProductKey = `${company}/${item}`;

  const requestedDate = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "";
  let month = sp.month ?? "";
  const nextAvailabilityStartAt = await getFareHarborNextAvailability(company, item);
  const nextAvailabilityMonth =
    typeof nextAvailabilityStartAt === "string" && nextAvailabilityStartAt.length >= 7
      ? nextAvailabilityStartAt.slice(0, 7)
      : "";

  if (!month) {
    if (requestedDate) {
      month = requestedDate.slice(0, 7);
    } else {
      month = nextAvailabilityMonth || new Date().toISOString().slice(0, 7);
    }
  }

  const { start, end } = monthRange(month);
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const monthLabel = formatMonthLabel(month);

  const availabilities = await getFareHarborAvailabilities(company, item, start, end);
  const days: Array<{ day: string; slots: unknown[] }> = groupByDay(availabilities);
  const byDay = new Map(days.map((d) => [d.day, d.slots]));
  const hasAnyAvailabilityThisMonth = days.some((d) => Array.isArray(d.slots) && d.slots.length > 0);
  const isShowingNextAvailableMonth = nextAvailabilityMonth && month === nextAvailabilityMonth;

  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");
  const allDays: string[] = [];
  for (let d = new Date(startDate); d < endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    allDays.push(d.toISOString().slice(0, 10));
  }

  const carriedContext = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (value && key !== "month") carriedContext.set(key, value);
  });
  if (!carriedContext.get("productSlug")) carriedContext.set("productSlug", canonicalProductKey);

  const monthHref = (targetMonth: string) => {
    const query = new URLSearchParams(carriedContext);
    query.set("month", targetMonth);
    return `/tours/${company}/${item}/calendar?${query.toString()}`;
  };

  const dayHref = (day: string) => {
    const query = new URLSearchParams(carriedContext);
    query.set("date", day);
    return `/tours/${company}/${item}/calendar/${day}?${query.toString()}`;
  };

  const telemetryPayload = {
    event: "calendar_start" as const,
    path: `/tours/${company}/${item}/calendar`,
    requestedLane: getParam(sp.requestedLane) || undefined,
    resolvedLane: getParam(sp.resolvedLane) || getParam((sp as any).lane) || undefined,
    degradedFallback: getParam(sp.degradedFallback) === "true" ? true : getParam(sp.degradedFallback) === "false" ? false : undefined,
    productSlug: getParam(sp.productSlug) || canonicalProductKey,
    rank: getParam(sp.rank) ? Number(getParam(sp.rank)) : undefined,
    port: getParam(sp.port) || undefined,
    topic: getParam((sp as any).topic) || undefined,
    subtype: getParam((sp as any).subtype) || undefined,
    sourcePage: getParam((sp as any).sourcePage) || getParam((sp as any).from) || undefined,
  };

  return (
    <>
      <StageTelemetry payload={telemetryPayload} enabled={Boolean(getParam((sp as any).from) === "plan" || getParam(sp.requestedLane))} />
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef6f6_45%,#f8fafc_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white"
        >
          Back to homepage
        </Link>

        <div className="mt-6 rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#ecfeff_55%,#eff6ff_100%)] p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
            Live FareHarbor Availability
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Choose a date</h1>
          <p className="mt-2 text-sm text-slate-600">
            Select a day with availability to see departure times and add the tour to the cart.
          </p>
          {!hasAnyAvailabilityThisMonth ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              {nextAvailabilityStartAt
                ? isShowingNextAvailableMonth
                  ? `No live departures are posted yet for ${monthLabel}.`
                  : `No live departures are posted for ${monthLabel}. The next available date is ${nextAvailabilityStartAt}.`
                : "No live departures are posted for this tour right now."}
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[2rem] border border-sky-100 bg-white/95 p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={monthHref(prevMonth)}
              className="inline-flex justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100"
            >
              Previous Month
            </Link>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white">
              {monthLabel}
            </div>
            <Link
              href={monthHref(nextMonth)}
              className="inline-flex justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100"
            >
              Next Month
            </Link>
          </div>

          <div className="hidden grid-cols-7 gap-2 md:grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <div key={w} className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-2 md:grid-cols-7 md:gap-2">
            {allDays.map((day) => {
              const slots = byDay.get(day) ?? [];
              const weekday = formatWeekdayLabel(day);
              return (
                <Link
                  key={day}
                  href={dayHref(day)}
                  className={[
                    "rounded-2xl border p-3 transition md:text-center",
                    slots.length
                      ? "border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#f0fdf4_100%)] shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
                      : "pointer-events-none border-slate-100 bg-slate-50 text-slate-400 opacity-60",
                  ].join(" ")}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:hidden">
                    {weekday}
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900 md:mt-0 md:text-sm md:font-semibold">
                    {day.slice(8, 10)}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {slots.length ? `${slots.length} departures` : "No departures"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

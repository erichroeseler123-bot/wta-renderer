import Link from "next/link";

async function getCalendar(
  company: string,
  item: string,
  start: string,
  end: string,
) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/fareharbor/calendar?company=${company}&item=${item}&start=${start}&end=${end}`;
  const r = await fetch(url, { cache: "no-store" });
  return r.json();
}

function monthRange(ym: string) {
  // ym = "2026-05"
  const [y, m] = ym.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const next = new Date(Date.UTC(y, m, 1)); // next month (m is 1-based in string; Date uses 0-based but we passed m)
  const end = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return { start, end };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ company: string; item: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { company, item } = await params;
  const sp = await searchParams;

  const month = sp.month ?? "2026-05"; // default for now
  const { start, end } = monthRange(month);

  const cal = await getCalendar(company, item, start, end);
  const days: Array<{ day: string; slots: any[] }> = cal.days ?? [];

  const byDay = new Map(days.map((d) => [d.day, d.slots]));
  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");

  // build day list for grid
  const allDays: string[] = [];
  for (
    let d = new Date(startDate);
    d < endDate;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    allDays.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <div className="text-sm text-white/70">
          {company} / {item} / {month}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w} className="text-xs text-white/50 px-2 py-1">
            {w}
          </div>
        ))}

        {allDays.map((day) => {
          const slots = byDay.get(day) ?? [];
          return (
            <Link
              key={day}
              href={`/tours/${company}/${item}/calendar/${day}`}
              className={[
                "rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition",
                slots.length ? "" : "opacity-50 pointer-events-none",
              ].join(" ")}
            >
              <div className="text-sm font-semibold text-white">
                {day.slice(8, 10)}
              </div>
              <div className="mt-1 text-xs text-white/70">
                {slots.length ? `${slots.length} departures` : "No departures"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

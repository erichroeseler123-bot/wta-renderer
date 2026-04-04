import { NextResponse } from "next/server";

function okJson(obj: any, status = 200) {
  return new NextResponse(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function groupByDay(availabilities: any[]) {
  const byDay = new Map<string, any[]>();

  for (const a of availabilities || []) {
    const startAt = String(a?.start_at ?? a?.startAt ?? "");
    if (startAt.length < 10) continue;
    const day = startAt.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(a);
  }

  const days = Array.from(byDay.entries())
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
        .map((s) => ({
          pk: Number(s?.pk ?? s?.availability_pk ?? 0),
          start_at: s?.start_at ?? s?.startAt,
          startAt: s?.startAt ?? s?.start_at,
          capacity: s?.capacity ?? null,
          customer_type_rates: s?.customer_type_rates ?? [],
        })),
    }));

  const totalSlots = days.reduce((sum, d) => sum + (d.slots?.length || 0), 0);
  return { days, totalSlots };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const company = searchParams.get("company") || "";
  const item = searchParams.get("item") || "";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  if (!company || !item || !start || !end) {
    return okJson(
      { ok: false, error: "Missing required params: company, item, start, end" },
      400,
    );
  }

  // Call OUR working endpoint (same origin)
  const base = new URL(req.url);
  base.pathname = "/api/fareharbor/availabilities";
  base.search = new URLSearchParams({
    company,
    item,
    start,
    end,
  }).toString();

  try {
    const res = await fetch(base.toString(), { next: { revalidate: 300 } });
    const j = await res.json();

    if (!j?.ok) {
      return okJson(
        {
          ok: false,
          error: "Upstream availabilities failed",
          upstream: j,
          url: base.toString(),
        },
        200,
      );
    }

    const avs: any[] = Array.isArray(j?.availabilities) ? j.availabilities : [];
    const { days, totalSlots } = groupByDay(avs);

    return okJson({
      ok: true,
      company,
      item: Number(item),
      start,
      end,
      days,
      totalSlots,
      count: avs.length,
    });
  } catch (e: any) {
    return okJson(
      { ok: false, error: "Calendar route failed", detail: String(e?.message || e) },
      200,
    );
  }
}

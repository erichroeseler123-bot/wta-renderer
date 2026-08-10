import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EVENTS = new Set(["phone_click", "booking_intent_click"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = String(body?.event || "");
    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const record = {
      event,
      path: String(body?.path || "").slice(0, 300),
      search: String(body?.search || "").slice(0, 500),
      href: String(body?.href || "").slice(0, 500),
      text: String(body?.text || "").slice(0, 120),
      ts: String(body?.ts || new Date().toISOString()).slice(0, 40),
    };

    console.info("WTA_INTENT_EVENT", JSON.stringify(record));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

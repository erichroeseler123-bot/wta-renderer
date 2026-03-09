import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { getOrderByPaymentIntent } from "@/lib/orders";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pi = String(searchParams.get("pi") || "");
  if (!pi) {
    return NextResponse.json({ success: false, error: "Missing ?pi=" }, { status: 400 });
  }

  const kv = await getKV();
  if (!kv) {
    return NextResponse.json({ success: false, error: "KV not configured" }, { status: 500 });
  }

  const receipt = await kv.get<Record<string, unknown>>(`receipt:${pi}`);
  if (receipt) {
    return NextResponse.json({ success: true, ...receipt });
  }

  const order = await getOrderByPaymentIntent(pi);
  if (!order) {
    return NextResponse.json({ success: true, status: "pending" });
  }

  return NextResponse.json({
    success: true,
    status: order.status,
    order_id: order.order_id,
    payment_intent_id: order.payment_intent_id,
    totalCents: order.totalCents,
    currency: order.currency,
    contact: order.contact,
    attribution: order.attribution || null,
    results: order.bookingResults || [],
    lastError: order.lastError || null,
    updatedAt: order.updatedAt,
  });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { listOrdersNeedingAttention } from "@/lib/orders";

export async function GET(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 50)));

  const orders = await listOrdersNeedingAttention(limit);
  return NextResponse.json({ success: true, orders });
}

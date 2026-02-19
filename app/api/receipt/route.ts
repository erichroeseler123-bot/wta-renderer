import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pi = String(searchParams.get("pi") || "");
  if (!pi) {
    return NextResponse.json({ success: false, error: "Missing ?pi=" }, { status: 400 });
  }
  const receipt = await kv.get<any>(`receipt:${pi}`);
  if (!receipt) {
    return NextResponse.json({ success: true, status: "pending" });
  }
  return NextResponse.json({ success: true, ...receipt });
}

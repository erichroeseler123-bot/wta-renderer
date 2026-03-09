import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearAdminCookie(res);
  return res;
}

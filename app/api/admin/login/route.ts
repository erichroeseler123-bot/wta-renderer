import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = String(body?.password || "");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { success: false, error: "Missing ADMIN_PASSWORD" },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ success: true });
  setAdminCookie(res);
  return res;
}

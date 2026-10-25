import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSigningSecret,
  getConfiguredAdminPassword,
  setAdminCookie,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function passwordsMatch(provided: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const expected = getConfiguredAdminPassword();
  const signingSecret = getAdminSigningSecret();
  if (!expected || !signingSecret) {
    return NextResponse.json(
      { success: false, error: "Admin authentication is not configured" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const rawPassword = typeof body?.password === "string" ? body.password : "";
  const trimmedPassword = rawPassword.trim();

  if (!trimmedPassword || (!passwordsMatch(rawPassword, expected) && !passwordsMatch(trimmedPassword, expected))) {
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ success: true });
  setAdminCookie(res);
  return res;
}

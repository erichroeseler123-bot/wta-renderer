import { NextRequest, NextResponse } from "next/server";
import { isAdminReq } from "@/lib/admin";
import { getKV } from "@/lib/kv";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Must be logged in as admin (cookie-based)
  if (!isAdminReq(req)) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  const siteUrl = (process.env.SITE_URL || "").replace(/\/+$/, "");

  if (!clientId || !siteUrl) {
    return NextResponse.json(
      { success: false, error: "Missing STRIPE_CONNECT_CLIENT_ID or SITE_URL" },
      { status: 500 }
    );
  }

  const kv = await getKV();
  if (!kv) {
    return NextResponse.json(
      { success: false, error: "KV not configured (need Redis/Upstash env vars)" },
      { status: 500 }
    );
  }

  // Anti-CSRF state stored server-side for 10 minutes
  const state = crypto.randomUUID();
  await kv.set(`stripe:oauth_state:${state}`, { ok: true }, { ex: 10 * 60 });

  const redirectUri = `${siteUrl}/api/admin/stripe/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params.toString()}`);
}

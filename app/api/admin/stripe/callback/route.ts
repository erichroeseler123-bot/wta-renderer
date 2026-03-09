import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdminReq } from "@/lib/admin";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminReq(req)) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/admin?err=${encodeURIComponent(error)}`, req.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL(`/admin?err=missing_code_or_state`, req.url));
  }

  const kv = await getKV();
  if (!kv) {
    return NextResponse.redirect(new URL(`/admin?err=kv_not_configured`, req.url));
  }

  const ok = await kv.get(`stripe:oauth_state:${state}`);
  if (!ok) {
    return NextResponse.redirect(new URL(`/admin?err=bad_state`, req.url));
  }
  await kv.del(`stripe:oauth_state:${state}`);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.redirect(new URL(`/admin?err=missing_stripe_secret`, req.url));
  }

  const stripe = new Stripe(stripeKey, {});

  const token = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });

  // Connected account id is stripe_user_id (acct_...)
  const accountId = (token as any)?.stripe_user_id as string | undefined;
  if (!accountId) {
    return NextResponse.redirect(new URL(`/admin?err=no_account_id`, req.url));
  }

  await kv.set("stripe:connected_account", accountId);

  return NextResponse.redirect(new URL(`/admin?connected=1`, req.url));
}

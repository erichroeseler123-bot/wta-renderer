import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import {
  clientIpFromHeaders,
  enforceRateLimit,
  logSecurityEvent,
  logServerError,
  requestId,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { success: false, error: message, ...(extra ? { extra } : {}) },
    { status },
  );
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function subscribeViaResend(email: string) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const audienceId = String(
    process.env.RESEND_NEWSLETTER_AUDIENCE_ID ||
      process.env.NEWSLETTER_RESEND_AUDIENCE_ID ||
      "",
  ).trim();

  if (!apiKey || !audienceId) {
    return { ok: false, reason: "resend_not_configured" as const };
  }

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (res.ok) {
    const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const providerId = typeof json?.id === "string" ? json.id : undefined;
    return { ok: true, provider: "resend" as const, providerId };
  }

  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const msg = String(json?.message || "");
  if (res.status === 409 || /already exists|already subscribed/i.test(msg)) {
    return { ok: true, provider: "resend" as const, alreadySubscribed: true };
  }

  return {
    ok: false,
    reason: "resend_error" as const,
    status: res.status,
    message: msg || `resend_status_${res.status}`,
  };
}

export async function POST(req: NextRequest) {
  const rid = requestId();
  const ip = clientIpFromHeaders(req.headers);
  try {
    const rl = await enforceRateLimit({
      key: `newsletter-subscribe:${ip}`,
      limit: 8,
      windowSec: 60,
    });
    if (!rl.ok) {
      logSecurityEvent("rate_limited_newsletter_subscribe", { rid, ip, retryAfterSec: rl.retryAfterSec });
      const r = jsonError("Too many attempts. Please wait and try again.", 429, { request_id: rid });
      r.headers.set("Retry-After", String(rl.retryAfterSec));
      return r;
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body.", 400);

    const email = normalizeEmail(body?.email);
    const source = String(body?.source || "site").trim().slice(0, 80);

    if (!isValidEmail(email)) return jsonError("Please enter a valid email.", 400);

    const resend = await subscribeViaResend(email);

    const kv = await getKV();
    if (kv) {
      await kv.set(`newsletter:subscriber:${email}`, {
        email,
        source,
        subscribedAt: new Date().toISOString(),
        provider: resend.ok ? resend.provider : "kv_only",
        providerId: resend.ok ? resend.providerId : undefined,
        ip,
      });
    }

    if (resend.ok) {
      return NextResponse.json({
        success: true,
        subscribed: true,
        alreadySubscribed: Boolean(resend.alreadySubscribed),
      });
    }

    if (resend.reason === "resend_not_configured") {
      return NextResponse.json({
        success: true,
        subscribed: true,
        queued: true,
      });
    }

    logServerError("/api/newsletter/subscribe", rid, new Error(String(resend.message || resend.reason)), {
      status: resend.status,
      source,
    });
    return jsonError("Unable to subscribe right now. Please try again shortly.", 502, {
      request_id: rid,
    });
  } catch (e: unknown) {
    logServerError("/api/newsletter/subscribe", rid, e);
    return jsonError("Subscribe failed.", 500, { request_id: rid });
  }
}

import { getKV } from "@/lib/kv";

export function requestId() {
  return `req_${crypto.randomUUID()}`;
}

export function clientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function logSecurityEvent(event: string, details: Record<string, unknown>) {
  console.warn(`[security] ${event}`, details);
}

export function logServerError(route: string, rid: string, err: unknown, details?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${route}] ${rid} ${message}`, details || {});
}

export async function enforceRateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}) {
  const kv = await getKV();
  if (!kv) return { ok: true, remaining: opts.limit, retryAfterSec: 0 };

  const now = Date.now();
  const bucketKey = `rl:${opts.key}`;
  const existing = (await kv.get<number[]>(bucketKey)) || [];
  const recent = Array.isArray(existing)
    ? existing.filter((ts) => Number.isFinite(ts) && now - Number(ts) < opts.windowSec * 1000)
    : [];

  if (recent.length >= opts.limit) {
    const oldest = recent[0] || now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((opts.windowSec * 1000 - (now - oldest)) / 1000),
    );
    return { ok: false, remaining: 0, retryAfterSec };
  }

  const next = [...recent, now];
  await kv.set(bucketKey, next, { ex: opts.windowSec });
  return { ok: true, remaining: Math.max(0, opts.limit - next.length), retryAfterSec: 0 };
}

type TurnstileVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string, ip?: string) {
  const secret = String(process.env.TURNSTILE_SECRET_KEY || "").trim();
  if (!secret) return { ok: true, reason: "not_configured" };

  if (!token) return { ok: false, reason: "missing_token" };

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json().catch(() => null)) as TurnstileVerifyResponse | null;
  if (!res.ok || !json?.success) {
    const codes = json?.["error-codes"] || [];
    return { ok: false, reason: codes.join(",") || "verification_failed" };
  }

  return { ok: true, reason: "verified" };
}

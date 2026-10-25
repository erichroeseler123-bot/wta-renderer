import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "wta_admin";
export const ADMIN_COOKIE_MAX_AGE_SEC = 60 * 60 * 8; // 8 hours
export const ADMIN_COOKIE_TTL_MS = ADMIN_COOKIE_MAX_AGE_SEC * 1000;
const MAX_CLOCK_SKEW_MS = 60 * 1000;

export function isPlaceholderAdminSecret(v: string): boolean {
  const trimmed = String(v || "").trim();
  if (!trimmed) return true;
  return /(put_yours_here|change_me_to_long_random|_or_test_xxx|^placeholder$|^replace_me$|^changeme$|^secret$|^password$)$/i.test(
    trimmed,
  );
}

export function getConfiguredAdminPassword(): string | null {
  const raw = String(process.env.ADMIN_PASSWORD || "").trim();
  if (!raw || isPlaceholderAdminSecret(raw)) {
    return null;
  }
  return raw;
}

export function getAdminSigningSecret(): string | null {
  const adminPassword = getConfiguredAdminPassword();
  if (!adminPassword) {
    return null;
  }

  const orderSecretRaw = String(process.env.ORDER_SIGNING_SECRET || "").trim();
  const orderSecret = isPlaceholderAdminSecret(orderSecretRaw) ? "" : orderSecretRaw;

  return crypto
    .createHmac("sha256", "wta-admin-cookie-signing-key-v1")
    .update(`${orderSecret}:${adminPassword}`)
    .digest("hex");
}

function hmacWithSecret(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function makeAdminCookieValue(issuedAtMs: number = Date.now()): string {
  const secret = getAdminSigningSecret();
  if (!secret) {
    throw new Error("Admin authentication is not configured (missing ADMIN_PASSWORD).");
  }
  const ts = Math.floor(Number(issuedAtMs));
  if (!Number.isSafeInteger(ts) || ts <= 0) {
    throw new Error("Invalid admin cookie timestamp.");
  }
  const payload = String(ts);
  const sig = hmacWithSecret(secret, payload);
  return `${payload}.${sig}`;
}

export function isAdminCookieValue(raw: string, nowMs: number = Date.now()): boolean {
  const secret = getAdminSigningSecret();
  if (!secret) {
    return false;
  }

  const trimmed = String(raw || "").trim();
  if (!trimmed) return false;

  const parts = trimmed.split(".");
  if (parts.length !== 2) return false;

  const [payload, sig] = parts;
  if (!/^\d{10,16}$/.test(payload)) return false;
  if (!/^[0-9a-f]{64}$/i.test(sig)) return false;

  const issuedAt = Number(payload);
  if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0) return false;
  if (issuedAt > nowMs + MAX_CLOCK_SKEW_MS) return false;
  if (nowMs - issuedAt > ADMIN_COOKIE_TTL_MS) return false;

  const expectedHex = hmacWithSecret(secret, payload);
  const providedBuf = Buffer.from(sig.toLowerCase(), "hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");
  if (providedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export function isAdminReq(req: NextRequest): boolean {
  const raw = req.cookies.get(ADMIN_COOKIE)?.value || "";
  return isAdminCookieValue(raw);
}

export function setAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, makeAdminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE_SEC,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

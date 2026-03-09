import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "wta_admin";

function hmac(payload: string) {
  const secret = process.env.ORDER_SIGNING_SECRET || "";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function makeAdminCookieValue() {
  const payload = String(Date.now());
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function isAdminCookieValue(raw: string) {
  const [payload, sig] = String(raw || "").split(".");
  if (!payload || !sig) return false;
  return hmac(payload) === sig;
}

export function isAdminReq(req: NextRequest) {
  const raw = req.cookies.get(ADMIN_COOKIE)?.value || "";
  return isAdminCookieValue(raw);
}

export function setAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, makeAdminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

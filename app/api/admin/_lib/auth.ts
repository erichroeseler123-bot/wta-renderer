import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin";

function extractCookieFromHeader(cookieHeader: string | null | undefined, name: string): string {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return "";
}

export async function requireAdmin(req?: Request) {
  let raw = "";
  if (req) {
    raw = extractCookieFromHeader(req.headers.get("cookie"), ADMIN_COOKIE);
  }
  if (!raw) {
    try {
      const jar = await cookies();
      raw = jar.get(ADMIN_COOKIE)?.value || "";
    } catch {
      // Outside Next.js request context (e.g. direct unit test invocation without req cookie)
    }
  }
  if (!isAdminCookieValue(raw)) return { ok: false as const };
  return { ok: true as const };
}


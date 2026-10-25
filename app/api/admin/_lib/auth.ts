import { cookies } from "next/headers";
import { isAdminCookieValue } from "@/lib/admin";

export async function requireAdmin() {
  const jar = await cookies();
  const raw = jar.get("wta_admin")?.value || "";
  if (!isAdminCookieValue(raw)) return { ok: false as const };
  return { ok: true as const };
}

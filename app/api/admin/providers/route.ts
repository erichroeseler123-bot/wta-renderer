import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { DurableStorageUnavailableError, setProviderHidden } from "@/lib/visibilityStore";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...(extra || {}) }, { status });
}

export async function POST(req: Request) {
  const a = await requireAdmin(req);
  if (!a.ok) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const company = String(body?.company || "");
  const hidden = !!body?.hidden;
  if (!company) return jsonError("Missing company", 400);

  try {
    const r = await setProviderHidden(company, hidden);
    return NextResponse.json({ success: true, company: r.company, hidden: r.hidden ? 1 : 0 });
  } catch (err) {
    if (err instanceof DurableStorageUnavailableError) {
      return jsonError(err.message, err.status, { code: err.code });
    }
    return jsonError(err instanceof Error ? err.message : "Failed to update provider visibility", 500);
  }
}

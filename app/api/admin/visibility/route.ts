import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { setTourHidden } from "@/lib/visibilityStore";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const key = String(body?.key || "");
  const hidden = !!body?.hidden;

  if (!key || !key.includes(":")) return jsonError("Missing/invalid key", 400);

  const r = await setTourHidden(key, hidden);
  return NextResponse.json({ success: true, key: r.key, hidden: r.hidden ? 1 : 0 });
}

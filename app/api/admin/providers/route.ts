import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { setProviderHidden } from "@/lib/visibilityStore";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const company = String(body?.company || "");
  const hidden = !!body?.hidden;
  if (!company) return jsonError("Missing company", 400);

  const r = await setProviderHidden(company, hidden);
  return NextResponse.json({ success: true, company: r.company, hidden: r.hidden ? 1 : 0 });
}

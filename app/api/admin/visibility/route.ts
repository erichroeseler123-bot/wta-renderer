import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import {
  setTourCatalogOverride,
  setTourHidden,
  type TourCatalogOverride,
} from "@/lib/visibilityStore";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const key = String(body?.key || "").trim().toLowerCase();

  if (!key || !key.includes(":")) return jsonError("Missing/invalid key", 400);

  let hiddenResult: { key: string; hidden: boolean; updatedAt: string } | null = null;
  if (typeof body?.hidden !== "undefined") {
    hiddenResult = await setTourHidden(key, !!body.hidden);
  }

  let overrideResult: {
    key: string;
    override: TourCatalogOverride | null;
    updatedAt: string;
  } | null = null;
  if ("override" in (body || {})) {
    const rawOverride = body.override;
    if (rawOverride === null) {
      overrideResult = await setTourCatalogOverride(key, null);
    } else if (rawOverride && typeof rawOverride === "object") {
      const sanitized: TourCatalogOverride = {};
      if (typeof rawOverride.title === "string") sanitized.title = rawOverride.title.trim();
      if (typeof rawOverride.fromPrice === "string") sanitized.fromPrice = rawOverride.fromPrice.trim();
      if (typeof rawOverride.priceUpdatedAt === "string" || rawOverride.priceUpdatedAt === null) {
        sanitized.priceUpdatedAt = rawOverride.priceUpdatedAt;
      }
      if (typeof rawOverride.description === "string") {
        sanitized.description = rawOverride.description.trim();
      }
      if (typeof rawOverride.duration === "string") sanitized.duration = rawOverride.duration.trim();
      if (typeof rawOverride.retired === "boolean") sanitized.retired = rawOverride.retired;
      overrideResult = await setTourCatalogOverride(key, sanitized);
    }
  }

  return NextResponse.json({
    success: true,
    key,
    hidden: hiddenResult ? (hiddenResult.hidden ? 1 : 0) : undefined,
    override: overrideResult ? overrideResult.override : undefined,
    updatedAt: overrideResult?.updatedAt || hiddenResult?.updatedAt || new Date().toISOString(),
  });
}

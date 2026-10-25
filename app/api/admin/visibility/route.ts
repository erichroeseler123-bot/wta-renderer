import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { isDurableKVConfigured } from "@/lib/kv";
import {
  DurableStorageUnavailableError,
  deleteIsolatedTestVisibilityRecord,
  getVisibility,
  setTourCatalogOverride,
  setTourHidden,
  type TourCatalogOverride,
} from "@/lib/visibilityStore";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...(extra || {}) }, { status });
}

export async function GET(req: Request) {
  const a = await requireAdmin(req);
  if (!a.ok) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const key = String(url.searchParams.get("key") || "").trim().toLowerCase();
  const db = await getVisibility();

  if (key) {
    const existsInTours = Object.prototype.hasOwnProperty.call(db.tours || {}, key);
    const existsInOverrides = Object.prototype.hasOwnProperty.call(db.overrides || {}, key);
    return NextResponse.json({
      success: true,
      key,
      exists: existsInTours || existsInOverrides,
      hidden: existsInTours ? (db.tours[key] ? 1 : 0) : null,
      override: existsInOverrides ? db.overrides?.[key] || null : null,
      updatedAt: db.updatedAt,
      durableStorageConfigured: isDurableKVConfigured(),
    });
  }

  return NextResponse.json({
    success: true,
    visibility: db,
    durableStorageConfigured: isDurableKVConfigured(),
  });
}

export async function POST(req: Request) {
  const a = await requireAdmin(req);
  if (!a.ok) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const key = String(body?.key || "").trim().toLowerCase();

  if (!key || !key.includes(":")) return jsonError("Missing/invalid key", 400);

  try {
    if (body?.delete === true) {
      if (!key.startsWith("__test_isolated__:")) {
        return jsonError("Only __test_isolated__:* keys can be deleted via delete=true", 400);
      }
      const saved = await deleteIsolatedTestVisibilityRecord(key);
      return NextResponse.json({
        success: true,
        key,
        deleted: true,
        updatedAt: saved.updatedAt,
      });
    }

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
  } catch (err) {
    if (err instanceof DurableStorageUnavailableError) {
      return jsonError(err.message, err.status, { code: err.code });
    }
    return jsonError(err instanceof Error ? err.message : "Failed to update visibility", 500);
  }
}

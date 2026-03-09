import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { requireAdmin } from "../_lib/auth";
import { getVisibility } from "../_lib/visibilityStore";

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

type TourLike = {
  company: string;
  companyName?: string;
  itemPk: number;
  itemName?: string;
};

function asString(v: any) {
  return (typeof v === "string" && v.trim()) ? v.trim() : "";
}
function asNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Recursively walk any JSON structure and collect objects that look like "tour items".
 * Heuristics:
 *  - company shortname might be in: company, company_shortname, shortname, provider, operator, etc.
 *  - item id might be in: itemPk, item_pk, item, pk, item_id
 *  - item name might be in: itemName, name, item_name, title
 */
function collectTours(root: any): TourLike[] {
  const out: TourLike[] = [];
  const seen = new Set<string>();

  const stack: any[] = [root];
  while (stack.length) {
    const cur = stack.pop();

    if (!cur) continue;

    if (Array.isArray(cur)) {
      for (const v of cur) stack.push(v);
      continue;
    }

    if (typeof cur !== "object") continue;

    // push children
    for (const k of Object.keys(cur)) stack.push((cur as any)[k]);

    // attempt to interpret this object as a tour
    const company =
      asString((cur as any).company) ||
      asString((cur as any).company_shortname) ||
      asString((cur as any).shortname) ||
      asString((cur as any).provider) ||
      asString((cur as any).operator) ||
      asString((cur as any).companyShortname);

    const itemPk =
      asNumber((cur as any).itemPk) ||
      asNumber((cur as any).item_pk) ||
      asNumber((cur as any).item) ||
      asNumber((cur as any).item_id) ||
      asNumber((cur as any).pk);

    if (!company || !itemPk) continue;

    const companyName =
      asString((cur as any).companyName) ||
      asString((cur as any).company_name) ||
      asString((cur as any).providerName) ||
      asString((cur as any).operator_name);

    const itemName =
      asString((cur as any).itemName) ||
      asString((cur as any).name) ||
      asString((cur as any).item_name) ||
      asString((cur as any).title);

    const key = `${company}:${itemPk}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ company, companyName: companyName || undefined, itemPk, itemName: itemName || undefined });
  }

  return out;
}

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return jsonError("Unauthorized", 401);

  const toursPath = path.join(process.cwd(), "public", "data", "tours.json");

  let raw: any;
  try {
    raw = JSON.parse(await fs.readFile(toursPath, "utf8"));
  } catch (e: any) {
    return jsonError("Missing/invalid public/data/tours.json (run build-tours).", 500, {
      details: String(e?.message || e),
      toursPath,
    });
  }

  const tours = collectTours(raw);
  const vis = await getVisibility();
  const providerHidden = vis.providers;
  const tourHidden = vis.tours;

  // group by company
  const map = new Map<string, { company: string; companyName?: string; hidden: number; tours: any[] }>();
  for (const t of tours) {
    const company = t.company;
    if (!map.has(company)) {
      map.set(company, {
        company,
        companyName: t.companyName,
        hidden: providerHidden[company] ? 1 : 0,
        tours: [],
      });
    }

    const key = `${t.company}:${t.itemPk}`;
    map.get(company)!.tours.push({
      key,
      itemPk: t.itemPk,
      itemName: t.itemName || `Item ${t.itemPk}`,
      hidden: tourHidden[key] ? 1 : 0,
    });
  }

  const providers = Array.from(map.values())
    .sort((a, b) => a.company.localeCompare(b.company))
    .map((p) => ({
      ...p,
      tours: p.tours.sort((x, y) => String(x.itemName).localeCompare(String(y.itemName))),
    }));

  return NextResponse.json({ success: true, providers, count: tours.length });
}

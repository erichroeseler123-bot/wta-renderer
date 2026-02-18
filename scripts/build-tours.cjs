/**
 * Build a cached tours list at public/data/tours.json
 * - Pulls items for each company
 * - Computes fromPrice = "From $X" using:
 *    1) structured price fields from item detail
 *    2) "$123" parsing from detail/list text
 *    3) last resort: availabilities scan (365d)
 * - Also computes rateSummary (Adult/Child/etc) when customer_prototypes are present
 * - Never lets a single item error kill a whole company
 */

const fs = require("fs");
const path = require("path");

// load env (works locally + prod)
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env.production.local" });
} catch (e) {}

function getKeys() {
  const APP_KEY =
    process.env.FAREHARBOR_APP_KEY ||
    process.env.FH_APP_KEY ||
    process.env.FAREHARBOR_APP ||
    "";

  const USER_KEY =
    process.env.FAREHARBOR_USER_KEY ||
    process.env.FH_USER_KEY ||
    process.env.FAREHARBOR_USER ||
    "";

  return { APP_KEY, USER_KEY };
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchWithTimeout(url, opts = {}, ms = 20000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fhFetchJson(url, APP_KEY, USER_KEY) {
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        "X-FareHarbor-API-App": APP_KEY,
        "X-FareHarbor-API-User": USER_KEY,
        Accept: "application/json",
      },
    },
    20000
  );

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    const err = new Error(`FareHarbor ${res.status} ${url}`);
    err.status = res.status;
    err.body = text.slice(0, 400);
    throw err;
  }

  return json;
}

async function fetchItemDetail(shortname, itemPk, APP_KEY, USER_KEY) {
  const url = `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(
    shortname
  )}/items/${encodeURIComponent(String(itemPk))}/`;

  try {
    const data = await fhFetchJson(url, APP_KEY, USER_KEY);
    return data?.item || data || null;
  } catch {
    return null;
  }
}

function computeFromCentsFromAvailabilities(availabilities) {
  let min = null;

  for (const a of availabilities || []) {
    const rates = a?.customer_type_rates || [];
    for (const r of rates) {
      const cents = r?.customer_prototype?.total;
      if (typeof cents === "number" && cents > 0) {
        if (min === null || cents < min) min = cents;
      }
    }
  }

  return min;
}

// IMPORTANT: require a $ so we don't treat "6 hours" as "$6"
function centsFromText(text) {
  if (!text) return 0;
  const s = String(text);
  const matches = [
    ...s.matchAll(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.(\d{2}))?/g),
  ];
  if (!matches.length) return 0;

  const cents = matches
    .map((m) => {
      const dollars = Number(String(m[1]).replace(/,/g, ""));
      const c = m[2] ? Number(m[2]) : 0;
      if (!Number.isFinite(dollars) || dollars <= 0) return 0;
      return dollars * 100 + c;
    })
    .filter((n) => Number.isFinite(n) && n > 0);

  return cents.length ? Math.min(...cents) : 0;
}

function itemFromCents(item) {
  const cps = item?.customer_prototypes || item?.customerPrototypes || [];
  if (Array.isArray(cps) && cps.length) {
    const vals = cps
      .map((p) => p?.total ?? p?.price ?? p?.rate)
      .filter((n) => typeof n === "number" && n > 0);
    if (vals.length) return Math.min(...vals);
  }

  const ctr = item?.customer_type_rates || item?.customerTypeRates || [];
  if (Array.isArray(ctr) && ctr.length) {
    const vals = ctr
      .map((r) => r?.customer_prototype?.total ?? r?.total ?? r?.price ?? r?.rate)
      .filter((n) => typeof n === "number" && n > 0);
    if (vals.length) return Math.min(...vals);
  }

  const v = item?.price || item?.rate || item?.options?.[0]?.price || 0;
  return typeof v === "number" && v > 0 ? v : 0;
}

function extractRateLabels(item) {
  // returns array of { label, cents }
  const cps = item?.customer_prototypes || item?.customerPrototypes || [];
  const out = [];

  if (!Array.isArray(cps)) return out;

  for (const p of cps) {
    const cents = p?.total ?? p?.price ?? p?.rate;
    if (typeof cents !== "number" || cents <= 0) continue;

    let label =
      p?.name ??
      p?.title ??
      p?.short_name ??
      p?.shortName ??
      p?.customer_type_name ??
      p?.customerTypeName ??
      p?.type ??
      "";

    label = String(label || "").trim();
    if (!label || /^rate$/i.test(label)) label = "";

    out.push({ label, cents });
  }

  // de-dupe
  const seen = new Set();
  const deduped = [];
  for (const r of out) {
    const k = `${r.label}::${r.cents}`;
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(r);
    }
  }

  // sort low to high
  deduped.sort((a, b) => a.cents - b.cents);

  return deduped;
}
function formatRateSummary(rates) {
  if (!rates || !rates.length) return "";
  const top = rates.slice(0, 3).map((r) => {
    const dollars = Math.floor(r.cents / 100);
    const label = r.label ? r.label.replace(/\s+/g, " ").trim() : "";
    return label ? (label + " " + dollars) : ("" + dollars);
  });
  const more = rates.length > 3 ? (" +" + (rates.length - 3) + " more") : "";
  return top.join(" • ") + more;
}


async function computeFromPriceSafe(shortname, itemPk, APP_KEY, USER_KEY) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 365);

  const url =
    `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(shortname)}` +
    `/availabilities/` +
    `?item=${encodeURIComponent(String(itemPk))}` +
    `&start=${encodeURIComponent(fmt(start))}` +
    `&end=${encodeURIComponent(fmt(end))}`;

  try {
    const data = await fhFetchJson(url, APP_KEY, USER_KEY);
    const list = data?.availabilities || data || [];
    const fromCents = computeFromCentsFromAvailabilities(list);
    if (fromCents && fromCents > 0) return `From $${Math.floor(fromCents / 100)}`;
    return "Check Price";
  } catch {
    return "Check Price";
  }
}

function categorize(name) {
  const title = String(name || "").toLowerCase();
  if (title.includes("helicopter") || title.includes("flight")) return "Air Tours";
  if (title.includes("whale")) return "Whale Watching";
  if (title.includes("dog") || title.includes("husky")) return "Dog Sledding";
  if (title.includes("hike") || title.includes("walk") || title.includes("glacier")) return "Hiking & Glaciers";
  if (title.includes("fish")) return "Fishing";
  return "Adventures";
}

async function buildTours() {
  const { APP_KEY, USER_KEY } = getKeys();

  if (!APP_KEY || !USER_KEY) {
    console.warn(
      "⚠ Missing FareHarbor keys. Set FAREHARBOR_APP_KEY and FAREHARBOR_USER_KEY (or FH_APP_KEY/FH_USER_KEY). Skipping build-tours."
    );
    return;
  }

  const companies = [
    "beyondak",
    "alaska-galore-juneau-whale-watching",
    "akhummer",
    "alaskatales",
    "aktraveladventures",
    "exclusivealaska",
    "coastalhelicopters",
    "dolphintours",
    "moorecharters",
    "alaskarainforest",
    "ketchikanadventurevue",
    "akduck",
    "northstartrekking",
    "kayakketchikan",
    "skagwayscooters",
    "snorkelalaska",
    "taquanair",
    "temsco-summercamp-juneau",
    "temscoair-juneau",
    "temscoair-skagway",
    "wingsairways",
  ];

  const allTours = [];

  for (const shortname of companies) {
    try {
      const itemsUrl = `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(shortname)}/items/`;
      const data = await fhFetchJson(itemsUrl, APP_KEY, USER_KEY);

      const items = (data?.items || []).filter((item) => {
        const n = String(item?.name || "").toLowerCase();
        return n && !n.includes("gift card") && !n.includes("gift certificate");
      });

      const CONCURRENCY = 4;

      for (let i = 0; i < items.length; i += CONCURRENCY) {
        const chunk = items.slice(i, i + CONCURRENCY);

        const chunkTours = await Promise.all(
          chunk.map(async (item) => {
            const pk = item.pk;

            const detail = await fetchItemDetail(shortname, pk, APP_KEY, USER_KEY);

            // optional (detail page): Adult/Child/etc summary if available
            const rates = detail ? extractRateLabels(detail) : [];
            const rateSummary = formatRateSummary(rates);

            // always (grid): compute min price
            let fromCents = detail ? itemFromCents(detail) : 0;

            if (!fromCents && detail) {
              const text = [
                detail?.headline,
                detail?.name,
                detail?.short_description,
                detail?.description,
                detail?.booking_notes,
                detail?.booking_notes_safe_html,
              ].filter(Boolean).join("\n");
              fromCents = centsFromText(text) || 0;
            }

            if (!fromCents) {
              const text = [
                item?.headline,
                item?.name,
                item?.short_description,
                item?.description,
              ].filter(Boolean).join("\n");
              fromCents = centsFromText(text) || 0;
            }

            let fromPrice = fromCents > 0 ? `From $${Math.floor(fromCents / 100)}` : "Check Price";

            if (fromPrice === "Check Price") {
              fromPrice = await computeFromPriceSafe(shortname, pk, APP_KEY, USER_KEY);
            }

            return {
              pk,
              title: item.name,
              slug: String(item.slug || item.name || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
              description: item.headline || item.description || "",
              image: item.hero_image_url || item.image_cdn_url || "",
              company: shortname,
              fromPrice,      // grid-safe
              rateSummary,    // optional extra detail
              category: categorize(item.name),
            };
          })
        );

        allTours.push(...chunkTours);
      }

      console.log(`✅ ${shortname}: ${items.length} items processed`);
    } catch (e) {
      console.warn(`⚠ ${shortname}: items fetch failed -> skipping company (${String(e?.message || e).slice(0, 160)})`);
    }
  }

  const dataPath = path.join(process.cwd(), "public/data/tours.json");
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(allTours, null, 2));

  const withDollar = allTours.filter((x) => String(x.fromPrice || "").includes("$")).length;
  const check = allTours.filter((x) => (x.fromPrice || "") === "Check Price").length;

  console.log(`✅ Success: Cached ${allTours.length} tours. With $: ${withDollar}. Check Price: ${check}.`);
}

buildTours();

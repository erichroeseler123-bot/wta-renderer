// app/tours/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import AddToItineraryButton from "@/app/components/cart/AddToItineraryButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FHItem = {
  pk: number;
  name: string;
  headline?: string | null;
  image_cdn_url?: string | null;
  description_safe_html?: string | null;
  cancellation_policy_safe_html?: string | null;
  ratings?: {
    google_reviews?: { rating?: number; user_ratings_total?: number } | null;
    tripadvisor?: unknown;
  } | null;
};

type ItemsResponse =
  | { ok: true; company: string; count: number; items: FHItem[] }
  | { ok: false; error: string };

function safeStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function safeNum(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

// VERY small allowlist so nobody can hit your API with arbitrary company names
const COMPANY_ALLOWLIST = [
  "temscoair-juneau",
  "taquanair",
  "coastalhelicopters",
  "beyondak",
  "northstartrekking",
  "moorecharters",
] as const;

const COMPANY_LABELS: Record<(typeof COMPANY_ALLOWLIST)[number], string> = {
  "temscoair-juneau": "TEMSCO (Juneau)",
  taquanair: "Taquan Air",
  coastalhelicopters: "Coastal Helicopters",
  beyondak: "Above & Beyond Alaska",
  northstartrekking: "NorthStar Trekking",
  moorecharters: "Juneau Charters",
};

type AllowedCompany = (typeof COMPANY_ALLOWLIST)[number];

function isAllowedCompany(x: string): x is AllowedCompany {
  return (COMPANY_ALLOWLIST as readonly string[]).includes(x);
}

type SortKey = "recommended" | "rating" | "name";

function isSortKey(x: string): x is SortKey {
  return x === "recommended" || x === "rating" || x === "name";
}

function ratingScore(it: FHItem): number {
  const r = it.ratings?.google_reviews?.rating;
  const n = it.ratings?.google_reviews?.user_ratings_total;
  if (typeof r !== "number") return -1;
  // weight by count so “4.9 (4 reviews)” doesn’t dominate
  const weight =
    typeof n === "number" ? Math.min(1, Math.log10(Math.max(1, n)) / 3) : 0.4;
  return r * (0.7 + 0.3 * weight);
}

/**
 * Build an absolute origin for server-side fetch().
 * - Local dev: uses headers() host + inferred proto
 * - Vercel: respects x-forwarded-proto / host
 */
async function getOriginFromRequest(): Promise<string> {
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.VERCEL_URL ||
    "localhost:3000";

  const proto =
    h.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

async function fetchItems(company: AllowedCompany): Promise<ItemsResponse> {
  const origin = await getOriginFromRequest();
  const res = await fetch(
    `${origin}/api/fareharbor/items?company=${encodeURIComponent(company)}`,
    { cache: "no-store" },
  );

  const data = (await res.json().catch(() => null)) as ItemsResponse | null;
  if (!data) return { ok: false, error: "Failed to parse response" };
  return data;
}

function chipList() {
  return [
    { k: "glacier", label: "Glacier" },
    { k: "helicopter", label: "Helicopter" },
    { k: "whale", label: "Whales" },
    { k: "kayak", label: "Kayak" },
    { k: "bear", label: "Bears" },
    { k: "private", label: "Private" },
  ] as const;
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; q?: string; sort?: string }>;
}) {
  const sp = await searchParams;

  const requestedCompany = safeStr(sp.company).trim();
  const company: AllowedCompany = isAllowedCompany(requestedCompany)
    ? requestedCompany
    : "temscoair-juneau";

  const supplierLabel = COMPANY_LABELS[company];

  const q = safeStr(sp.q).trim();
  const sort: SortKey = isSortKey(safeStr(sp.sort).trim())
    ? (sp.sort as SortKey)
    : "recommended";

  const data = await fetchItems(company);

  const items = data.ok ? data.items : [];

  // server-side filtering
  const filtered = q
    ? items.filter((it) => {
        const hay = `${safeStr(it.name)} ${safeStr(it.headline)}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
    : items;

  // server-side sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return safeStr(a.name).localeCompare(safeStr(b.name));
    if (sort === "rating") return ratingScore(b) - ratingScore(a);

    // "recommended": prefer items with imagery + headline + rating
    const aScore =
      (safeStr(a.image_cdn_url) ? 3 : 0) +
      (safeStr(a.headline) ? 2 : 0) +
      (ratingScore(a) > 0 ? 2 : 0);

    const bScore =
      (safeStr(b.image_cdn_url) ? 3 : 0) +
      (safeStr(b.headline) ? 2 : 0) +
      (ratingScore(b) > 0 ? 2 : 0);

    if (bScore !== aScore) return bScore - aScore;
    return safeStr(a.name).localeCompare(safeStr(b.name));
  });

  function buildHref(next: { company?: string; q?: string; sort?: SortKey }) {
    const params = new URLSearchParams();
    params.set("company", next.company ?? company);
    if (next.q) params.set("q", next.q);
    if (next.sort && next.sort !== "recommended") params.set("sort", next.sort);
    const s = params.toString();
    return s ? `/tours?${s}` : "/tours";
  }

  return (
    <main className="page-container py-8 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Alaska tours — live inventory
          </h1>
          <p className="page-subtitle mt-2 text-white/70 leading-relaxed">
            Browse real FareHarbor inventory by supplier, search by keyword, and
            add multiple tours to your itinerary cart.
          </p>
        </div>

        {/* Supplier chips */}
        <div className="flex flex-wrap gap-2">
          {COMPANY_ALLOWLIST.map((c) => {
            const active = c === company;
            return (
              <Link
                key={c}
                href={buildHref({ company: c, q, sort })}
                className={[
                  "rounded-xl border px-3 py-2 text-sm transition",
                  active
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                title={c}
              >
                {COMPANY_LABELS[c]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <form action="/tours" className="flex w-full gap-2 md:max-w-2xl">
            <input type="hidden" name="company" value={company} />
            {sort !== "recommended" ? (
              <input type="hidden" name="sort" value={sort} />
            ) : null}

            <div className="relative w-full">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search: glacier, helicopter, whales, kayak, bear…"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
              />
              {q ? (
                <Link
                  href={buildHref({ company, sort })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/55 hover:text-white"
                >
                  Clear
                </Link>
              ) : null}
            </div>

            <button
              type="submit"
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              Search
            </button>
          </form>

          {/* Sort */}
          <form action="/tours" className="flex items-center gap-2">
            <input type="hidden" name="company" value={company} />
            {q ? <input type="hidden" name="q" value={q} /> : null}

            <label className="text-xs text-white/50">Sort</label>
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>

            <button
              type="submit"
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
            >
              Apply
            </button>
          </form>
        </div>

        {/* Quick chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {chipList().map((c) => {
            const nextQ = c.k;
            const active = q.toLowerCase() === c.k;
            return (
              <Link
                key={c.k}
                href={buildHref({ company, q: active ? "" : nextQ, sort })}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  active
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {c.label}
              </Link>
            );
          })}
          <div className="ml-auto hidden md:block text-xs text-white/45">
            Supplier: <span className="text-white/70">{supplierLabel}</span>
          </div>
        </div>
      </div>

      {/* States */}
      {!data.ok ? (
        <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-white">
          <div className="text-lg font-semibold">Couldn’t load tours</div>
          <div className="mt-2 text-white/80">{data.error}</div>
          <div className="mt-3 text-sm text-white/70">
            Try refreshing, or switch suppliers above.
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
          {q ? (
            <>
              No tours matched <span className="text-white">“{q}”</span> for{" "}
              <span className="text-white">{supplierLabel}</span>.
            </>
          ) : (
            <>
              No tours returned for{" "}
              <span className="text-white">{supplierLabel}</span>.
            </>
          )}
        </div>
      ) : (
        <>
          {/* Count row */}
          <div className="mt-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/65">
              Showing{" "}
              <span className="text-white font-medium">{sorted.length}</span>{" "}
              tour(s) from{" "}
              <span className="text-white font-medium">{supplierLabel}</span>
              {q ? (
                <>
                  {" "}
                  matching <span className="text-white font-medium">“{q}”</span>
                </>
              ) : null}
              {sort !== "recommended" ? (
                <>
                  {" "}
                  • sorted by <span className="text-white/80">{sort}</span>
                </>
              ) : null}
            </div>
            <div className="text-xs text-white/45">
              Click a card for details. “Add to itinerary” builds a multi-stop
              plan.
            </div>
          </div>

          {/* Cards */}
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((it) => {
              const pk = safeNum(it.pk);
              const title = safeStr(it.name, "Tour");
              const headline = safeStr(it.headline, "");
              const img = safeStr(it.image_cdn_url, "");

              const rating = it.ratings?.google_reviews?.rating;
              const count = it.ratings?.google_reviews?.user_ratings_total;

              const href =
                pk > 0
                  ? `/tours/${company}/${pk}`
                  : buildHref({ company, q, sort });

              return (
                <div
                  key={`${company}-${pk}-${title}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition"
                >
                  <Link href={href} className="block">
                    <div className="relative h-48 w-full overflow-hidden">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={title}
                          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-white/5" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                        <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/80">
                          {supplierLabel}
                        </div>
                        {typeof rating === "number" ? (
                          <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/80">
                            ⭐ {rating.toFixed(1)}
                            {typeof count === "number" ? ` (${count})` : ""}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-white leading-snug">
                        {title}
                      </h3>

                      {headline ? (
                        <p className="mt-2 text-white/70 leading-relaxed line-clamp-3">
                          {headline}
                        </p>
                      ) : (
                        <p className="mt-2 text-white/50 text-sm">
                          Open details to see duration, meeting point, and
                          availability.
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="px-5 pb-5">
                    <div className="grid gap-2">
                      <AddToItineraryButton
                        company={company}
                        itemPk={pk}
                        title={title}
                        headline={headline || undefined}
                        image={img || undefined}
                        supplierLabel={supplierLabel}
                      />

                      <Link
                        href={href}
                        className="text-sm text-white/70 hover:text-white hover:underline underline-offset-4"
                        aria-label={`View details for ${title}`}
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/70 text-sm">
            <div className="font-medium text-white">Next step</div>
            <div className="mt-1">
              Add a few tours, then open the itinerary cart in the top nav to
              keep notes and check out per supplier.
            </div>
          </div>
        </>
      )}
    </main>
  );
}

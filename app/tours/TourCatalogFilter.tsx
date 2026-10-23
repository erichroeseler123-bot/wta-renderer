"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { HelicopterTour } from "@/lib/helicopterTours";
import { buildTourPriceLabel, getProductOneLiner } from "@/lib/tourSeo";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import {
  appendWidgetContextToSearchParams,
  resolveWidgetInitContext,
} from "@/lib/widgetContext";
import {
  emitWidgetLifecycleEvent,
  widgetViewStorageKey,
} from "@/components/widget/widgetLifecycle";
import {
  buildCatalogOutboundSearchParams,
  buildTourFilterStatusMessage,
  filterCatalogTours,
  formatCategoryFilterLabel,
  formatPortFilterLabel,
  getCategoryFilterOptions,
  getPortFilterOptions,
  isTourFilterActive,
  normalizeCategoryFilter,
  normalizePortFilter,
  resetTourCatalogFilters,
} from "@/lib/tourCatalogFilters";

export type CatalogMode = "widget" | "tours";

function bookingHref(tour: HelicopterTour, search: URLSearchParams) {
  if (tour.nextAvailableDate) {
    const d = new Date(tour.nextAvailableDate);
    if (!Number.isNaN(d.getTime())) {
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const params = new URLSearchParams(search.toString());
      params.set("month", month);
      return `/tours/${tour.company}/${tour.pk}/calendar?${params.toString()}`;
    }
  }
  const qs = search.toString();
  return qs
    ? `/tours/${tour.company}/${tour.pk}/calendar?${qs}`
    : `/tours/${tour.company}/${tour.pk}/calendar`;
}

export default function TourCatalogFilter({
  tours,
  mode = "tours",
  initialPort,
  initialCategory,
}: {
  tours: HelicopterTour[];
  mode?: CatalogMode;
  initialPort?: string;
  initialCategory?: string;
}) {
  const search = useSearchParams();
  const pathname = usePathname();
  const searchString = search ? search.toString() : "";

  const [selectedPort, setSelectedPort] = useState<string>(() =>
    normalizePortFilter(initialPort ?? search?.get("port")),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    normalizeCategoryFilter(initialCategory ?? search?.get("category")),
  );

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setSelectedPort(normalizePortFilter(params.get("port")));
    setSelectedCategory(normalizeCategoryFilter(params.get("category")));
  }, [searchString]);

  const syncUrlParams = (nextPort: string, nextCategory: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (nextPort === "all") {
      params.delete("port");
    } else {
      params.set("port", nextPort);
    }

    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  const handlePortChange = (value: string) => {
    const nextPort = normalizePortFilter(value);
    setSelectedPort(nextPort);
    syncUrlParams(nextPort, selectedCategory);
  };

  const handleCategoryChange = (value: string) => {
    const nextCategory = normalizeCategoryFilter(value);
    setSelectedCategory(nextCategory);
    syncUrlParams(selectedPort, nextCategory);
  };

  const handleResetFilters = () => {
    const reset = resetTourCatalogFilters();
    setSelectedPort(reset.port);
    setSelectedCategory(reset.category);
    syncUrlParams(reset.port, reset.category);
  };

  const handoffKeyRef = useRef<string | null>(null);
  const handoffCategoryRef = useRef<string | undefined>(undefined);

  const baseSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const handoffKey =
      params.get("handoff_id") ||
      params.get("handoffId") ||
      params.get("dcc_handoff_id") ||
      (params.get("source") === "dcc" ? "dcc" : "");

    if (handoffKey) {
      if (handoffKeyRef.current !== handoffKey) {
        handoffKeyRef.current = handoffKey;
        handoffCategoryRef.current = params.get("category") || undefined;
      }
    } else {
      handoffKeyRef.current = null;
      handoffCategoryRef.current = undefined;
    }

    return buildCatalogOutboundSearchParams(
      searchString,
      handoffCategoryRef.current,
    );
  }, [searchString]);

  const widgetContext = useMemo(
    () => resolveWidgetInitContext(baseSearchParams),
    [baseSearchParams],
  );

  useEffect(() => {
    if (!widgetContext.handoffId || widgetContext.source !== "dcc") return;

    const storageKey = widgetViewStorageKey(
      widgetContext.handoffId,
      pathname,
      widgetContext.widgetId,
    );
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) return;

    void emitWidgetLifecycleEvent({
      ...widgetContext,
      portSlug: widgetContext.portSlug || canonicalizePortSlug("juneau"),
      eventType: "handoff_viewed",
      sourcePath: pathname,
      status: "viewed",
      stage: "widget_rendered",
    }).then(() => {
      if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
    });
  }, [pathname, widgetContext]);

  const filteredTours = useMemo(
    () =>
      filterCatalogTours(tours, {
        port: selectedPort,
        category: selectedCategory,
      }),
    [tours, selectedPort, selectedCategory],
  );

  const portOptions = useMemo(
    () => getPortFilterOptions(tours, selectedCategory),
    [tours, selectedCategory],
  );

  const categoryOptions = useMemo(
    () => getCategoryFilterOptions(tours, selectedPort),
    [tours, selectedPort],
  );

  const hasActiveFilters = isTourFilterActive({
    port: selectedPort,
    category: selectedCategory,
  });

  const activePortLabel = formatPortFilterLabel(selectedPort);
  const activeCategoryLabel = formatCategoryFilterLabel(selectedCategory);

  const statusMessage = useMemo(
    () =>
      buildTourFilterStatusMessage({
        filteredCount: filteredTours.length,
        totalCount: tours.length,
        port: selectedPort,
        category: selectedCategory,
      }),
    [filteredTours.length, tours.length, selectedPort, selectedCategory],
  );

  const portOnlyCount = useMemo(
    () =>
      selectedPort === "all"
        ? tours.length
        : filterCatalogTours(tours, { port: selectedPort, category: "all" }).length,
    [tours, selectedPort],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl min-w-0 flex-col overflow-x-clip px-4 py-4 sm:px-6 sm:py-6">
      {mode === "widget" && (
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-7">
          <div className="absolute inset-0">
            <img
              src={tours[0]?.image || "/hero/juneau.jpg"}
              alt="Juneau helicopter tours"
              className="h-full w-full object-cover opacity-35"
              loading="eager"
            />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.66)_44%,rgba(2,6,23,0.9)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_24%)]" />
          </div>
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
              Juneau Helicopter Tours
            </div>
            <h1 className="mt-4 text-[2.3rem] font-black uppercase leading-[0.94] tracking-[-0.04em] text-white sm:text-[3.8rem]">
              Compare tours fast. Open the right one.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-[15px]">
              Cruise-day friendly Juneau helicopter tour pages with cleaner visuals, faster scanning,
              and one clear path into the booking calendar.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                Live booking calendar
              </div>
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                Cruise-day friendly
              </div>
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                Helicopter tours only
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/date-search"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-955"
              >
                Search By Date
              </Link>
              <Link
                href="/tours"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/14 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white"
              >
                Browse All Tours
              </Link>
            </div>
          </div>
        </section>
      )}

      <section
        aria-label="Filter shore excursions"
        className="w-full min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
              Filter tour catalog
            </div>
            <div
              id="tour-catalog-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-testid="tour-filter-status"
              className="mt-1 min-w-0 break-words text-sm font-black text-slate-900 sm:text-base"
            >
              {statusMessage}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              data-testid="reset-tour-filters"
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="tour-port-filter"
              className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500"
            >
              Port
            </label>
            <select
              id="tour-port-filter"
              name="port"
              value={selectedPort}
              onChange={(e) => handlePortChange(e.target.value)}
              aria-controls="tour-catalog-results"
              className="mt-1.5 min-h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-slate-900 sm:text-sm"
            >
              {portOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor="tour-category-filter"
              className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500"
            >
            Category
            </label>
            <select
              id="tour-category-filter"
              name="category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              aria-controls="tour-catalog-results"
              className="mt-1.5 min-h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-slate-900 sm:text-sm"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Quick port filter
            </span>
            <div
              role="group"
              aria-label="Filter by port"
              className="mt-2 flex flex-wrap gap-1.5 sm:gap-2"
            >
              {portOptions.map((option) => {
                const active = selectedPort === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handlePortChange(option.value)}
                    className={`inline-flex min-h-10 max-w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <span>
                      {option.label} ({option.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Quick category filter
            </span>
            <div
              role="group"
              aria-label="Filter by category"
              className="mt-2 flex flex-wrap gap-1.5 sm:gap-2"
            >
              {categoryOptions.map((option) => {
                const active = selectedCategory === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleCategoryChange(option.value)}
                    className={`inline-flex min-h-10 max-w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <span>
                      {option.label} ({option.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {filteredTours.length === 0 ? (
        <section
          id="tour-catalog-results"
          data-testid="tour-empty-state"
          className="mt-5 w-full min-w-0 rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8"
        >
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
            No matching excursions
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            No tours match {activePortLabel} · {activeCategoryLabel}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Reset your active filters in one tap to browse all {tours.length} Alaska shore
            excursions across Juneau, Skagway, and Ketchikan.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-slate-800"
            >
              Show all {tours.length} tours
            </button>
            {selectedPort !== "all" && selectedCategory !== "all" && portOnlyCount > 0 ? (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Keep {activePortLabel} · All Categories ({portOnlyCount})
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <section
          id="tour-catalog-results"
          className="mt-5 grid min-w-0 gap-5 lg:grid-cols-2"
        >
          {filteredTours.map((tour) => {
            const params = appendWidgetContextToSearchParams(
              new URLSearchParams(baseSearchParams.toString()),
              {
                ...widgetContext,
                portSlug: widgetContext.portSlug || canonicalizePortSlug(tour.port),
                productSlug: widgetContext.productSlug || tour.slug,
              },
            );
            const qs = params.toString();
            const detailBasePath = mode === "tours" ? "/tours" : "/widget";
            const detailHref = qs
              ? `${detailBasePath}/${tour.company}/${tour.pk}?${qs}`
              : `${detailBasePath}/${tour.company}/${tour.pk}`;
            const bookingPageHref = bookingHref(tour, new URLSearchParams(qs));
            const imageSrc = tour.image || "/hero/juneau.jpg";
            const hasNextAvailability = Boolean(tour.nextAvailableDate);
            const availabilityIsUnknown = !hasNextAvailability && tour.hasInventory !== false;
            const priceLabel = buildTourPriceLabel(tour);

            return (
              <article
                key={`${tour.company}:${tour.pk}`}
                className="flex min-w-0 flex-col justify-between overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="relative aspect-[16/10] w-full">
                  <img
                    src={imageSrc}
                    alt={tour.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                  <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md">
                    {tour.company.replace(/-/g, " ")}
                  </div>
                  <div className="absolute bottom-4 right-4 max-w-[calc(100%-2rem)] rounded-2xl border border-white/25 bg-white/15 px-3 py-2 text-right text-white shadow-lg backdrop-blur-md">
                    <div className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      {tour.category || "Juneau Tour"}
                    </div>
                    <div className="break-words text-sm font-black">{priceLabel}</div>
                  </div>
                </div>

                <div className="flex flex-grow flex-col justify-between space-y-4 p-5 sm:p-6">
                  <div className="space-y-2">
                    <h2 className="break-words text-2xl font-black leading-tight tracking-tight text-slate-900">
                      {tour.title}
                    </h2>
                    <p className="line-clamp-1 text-xs leading-relaxed text-slate-600">
                      {getProductOneLiner(tour)}
                    </p>

                    {/* Specifications Grid */}
                    <div className="my-2 grid grid-cols-3 gap-2 border-y border-slate-100 py-2 text-[10px]">
                      <div className="min-w-0">
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          Duration
                        </span>
                        <span className="break-words font-extrabold text-slate-800">
                          {(() => {
                            const m = (tour.description || "").match(
                              /\b(\d+(?:\.\d+)?)\s*Hours?\b/i,
                            );
                            return m ? `${m[1]} Hours` : "2-3 Hours";
                          })()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          From Price
                        </span>
                        <span className="break-words font-extrabold text-slate-800">
                          {priceLabel}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          Availability
                        </span>
                        <span
                          className={`break-words font-extrabold ${
                            hasNextAvailability ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {hasNextAvailability ? "Live Dates" : "Check Calendar"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-2 sm:flex-row">
                    <Link
                      href={detailHref}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      View Product
                    </Link>
                    {hasNextAvailability ? (
                      <Link
                        href={bookingPageHref}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-cyan-400 px-4 text-xs font-bold text-slate-955 transition hover:bg-cyan-300"
                      >
                        Book Now
                      </Link>
                    ) : availabilityIsUnknown ? (
                      <Link
                        href={bookingPageHref}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-cyan-400 px-4 text-xs font-bold text-slate-955 transition hover:bg-cyan-300"
                      >
                        Check Dates
                      </Link>
                    ) : (
                      <div className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-amber-250 bg-amber-50 px-4 text-xs font-bold text-amber-900">
                        No live dates
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {hasActiveFilters && filteredTours.length > 0 && filteredTours.length <= 4 && (
        <section
          data-testid="tour-narrow-recovery"
          className="mt-5 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">
            Narrow filter active ({filteredTours.length} of {tours.length} tours shown for{" "}
            {activePortLabel} · {activeCategoryLabel}). Want to compare more options?
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-slate-800"
          >
            Show all {tours.length} tours
          </button>
        </section>
      )}
    </main>
  );
}

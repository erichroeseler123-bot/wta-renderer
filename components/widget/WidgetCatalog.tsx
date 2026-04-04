"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { HelicopterTour } from "@/lib/helicopterTours";
import { buildTourPriceLabel, cleanTourDescription } from "@/lib/tourSeo";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import {
  appendWidgetContextToSearchParams,
  resolveWidgetInitContext,
} from "@/lib/widgetContext";
import { emitWidgetLifecycleEvent, widgetViewStorageKey } from "@/components/widget/widgetLifecycle";

type CatalogMode = "widget" | "tours";

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
  return qs ? `/tours/${tour.company}/${tour.pk}/calendar?${qs}` : `/tours/${tour.company}/${tour.pk}/calendar`;
}

export function WidgetCatalog({
  tours,
  mode = "widget",
}: {
  tours: HelicopterTour[];
  mode?: CatalogMode;
}) {
  const search = useSearchParams();
  const pathname = usePathname();
  const widgetContext = useMemo(() => resolveWidgetInitContext(search), [search]);

  useEffect(() => {
    if (!widgetContext.handoffId || widgetContext.source !== "dcc") return;

    const storageKey = widgetViewStorageKey(widgetContext.handoffId, pathname, widgetContext.widgetId);
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-6">
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
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950"
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

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        {tours.map((tour) => {
          const params = appendWidgetContextToSearchParams(
            new URLSearchParams(search.toString()),
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
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="relative aspect-[16/10] w-full">
                <img
                  src={imageSrc}
                  alt={tour.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md">
                  {tour.company.replace(/-/g, " ")}
                </div>
                <div className="absolute bottom-4 right-4 rounded-2xl border border-white/25 bg-white/15 px-3 py-2 text-right text-white shadow-lg backdrop-blur-md">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    {tour.category || "Juneau Tour"}
                  </div>
                  <div className="text-sm font-black">{priceLabel}</div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {tour.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {cleanTourDescription(
                    tour.description,
                    "Open the product to view details and booking options."
                  )}
                </p>
                <div className="mt-3 text-sm font-semibold text-slate-900">
                  {tour.fromPrice && tour.nextAvailableDate
                    ? `${priceLabel} • Next available ${tour.nextAvailableDate}`
                    : tour.nextAvailableDate
                      ? `Next available ${tour.nextAvailableDate}`
                      : priceLabel}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={detailHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white"
                  >
                    View Product
                  </Link>
                  {hasNextAvailability ? (
                    <Link
                      href={bookingPageHref}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950"
                    >
                      Book Now
                    </Link>
                  ) : availabilityIsUnknown ? (
                    <Link
                      href={bookingPageHref}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950"
                    >
                      Check Dates
                    </Link>
                  ) : (
                    <div className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900">
                      No dates available yet
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

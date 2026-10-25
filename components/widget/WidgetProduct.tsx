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

export function WidgetProduct({
  tour,
  catalogHrefBase = "/widget",
}: {
  tour: HelicopterTour;
  catalogHrefBase?: string;
}) {
  const search = useSearchParams();
  const pathname = usePathname();
  const widgetContext = useMemo(() => resolveWidgetInitContext(search), [search]);
  const imageSrc = tour.image || "/hero/juneau.jpg";
  const gallery = (tour.imageGallery && tour.imageGallery.length ? tour.imageGallery : [imageSrc]).filter(Boolean);
  const trackingParams = appendWidgetContextToSearchParams(
    new URLSearchParams(search.toString()),
    {
      ...widgetContext,
      portSlug: widgetContext.portSlug || canonicalizePortSlug(tour.port),
      productSlug: widgetContext.productSlug || tour.slug,
    },
  );
  const bookingPageHref = bookingHref(tour, trackingParams);
  const hasNextAvailability = Boolean(tour.nextAvailableDate);
  const availabilityIsUnknown = !hasNextAvailability && tour.hasInventory !== false;
  const priceLabel = buildTourPriceLabel(tour);
  const catalogHref = (() => {
    const qs = trackingParams.toString();
    return qs ? `${catalogHrefBase}?${qs}` : catalogHrefBase;
  })();

  useEffect(() => {
    if (!widgetContext.handoffId || widgetContext.source !== "dcc") return;

    const storageKey = widgetViewStorageKey(widgetContext.handoffId, pathname, widgetContext.widgetId);
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) return;

    void emitWidgetLifecycleEvent({
      ...widgetContext,
      portSlug: widgetContext.portSlug || canonicalizePortSlug(tour.port),
      productSlug: widgetContext.productSlug || tour.slug,
      eventType: "handoff_viewed",
      sourcePath: pathname,
      status: "viewed",
      stage: "widget_rendered",
    }).then(() => {
      if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
    });
  }, [pathname, tour.port, tour.slug, widgetContext]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="relative aspect-[4/3] w-full">
          <img
            src={imageSrc}
            alt={tour.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md">
            {tour.company.replace(/-/g, " ")}
          </div>
          <div className="absolute bottom-4 right-4 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-right text-white shadow-lg backdrop-blur-md">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              {tour.category || "Juneau Tour"}
            </div>
            <div className="text-base font-black">{priceLabel}</div>
          </div>
        </div>

        {gallery.length > 1 ? (
          <div className="grid grid-cols-2 gap-2 border-t border-stone-200 bg-stone-50 p-2 sm:grid-cols-3">
            {gallery.map((src) => (
              <div key={src} className="overflow-hidden rounded-2xl bg-white">
                <img
                  src={src}
                  alt={tour.title}
                  className="aspect-[4/3] h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="p-4 sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Juneau Helicopter Tour
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {tour.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {cleanTourDescription(
              tour.description,
              "Open booking to view available dates and departures."
            )}
          </p>

          <div className="mt-4 rounded-2xl bg-stone-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Pricing And Availability
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {tour.fromPrice && tour.nextAvailableDate
                ? `${priceLabel} • Next available ${tour.nextAvailableDate}`
                : tour.nextAvailableDate
                  ? `Next available ${tour.nextAvailableDate}`
                  : priceLabel}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {hasNextAvailability ? (
              <Link
                href={bookingPageHref}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Book This Tour
              </Link>
            ) : availabilityIsUnknown ? (
              <Link
                href={bookingPageHref}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Check Live Dates
              </Link>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">
                No live dates are posted for this tour yet
              </div>
            )}
            <Link
              href={catalogHref}
              className="inline-flex items-center justify-center rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold text-slate-900"
            >
              View All Tours
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

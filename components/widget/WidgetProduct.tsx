"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { HelicopterTour } from "@/lib/helicopterTours";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import {
  inferEmbedContextFromWindow,
  parseWidgetInitContext,
} from "@/lib/widgetContext";
import {
  buildWidgetBookingUrl,
  formatWidgetDescription,
  formatWidgetDuration,
  formatWidgetPrice,
  getOperatorDisplayName,
  getPortDisplayName,
  sanitizeAccentColor,
  sanitizePlacementLabel,
  sanitizeWidgetLayout,
  type WidgetLayoutMode,
  type WidgetTourStatus,
} from "@/lib/tourWidget";
import { emitWidgetLifecycleEvent, widgetViewStorageKey } from "@/components/widget/widgetLifecycle";

export type WidgetProductProps = {
  tour: HelicopterTour | null;
  status?: WidgetTourStatus;
  reason?: string;
  requestedCompany?: string;
  requestedItem?: string;
  initialLayout?: WidgetLayoutMode;
  initialAccent?: string;
  initialPlacement?: string;
  catalogHrefBase?: string;
};

export function WidgetProduct({
  tour,
  status = "active",
  reason,
  requestedCompany,
  requestedItem,
  initialLayout,
  initialAccent,
  initialPlacement,
}: WidgetProductProps) {
  const search = useSearchParams();
  const pathname = usePathname();
  const [imageFailed, setImageFailed] = useState(false);
  const [inferredEmbed, setInferredEmbed] = useState<{
    embedDomain?: string;
  }>({});

  useEffect(() => {
    setInferredEmbed(inferEmbedContextFromWindow());
  }, []);

  const widgetContext = useMemo(() => {
    const parsed = parseWidgetInitContext(search);
    return {
      ...parsed,
      embedDomain: parsed.embedDomain || inferredEmbed.embedDomain,
    };
  }, [search, inferredEmbed]);

  const layout = useMemo(
    () => sanitizeWidgetLayout(search.get("layout") || initialLayout),
    [search, initialLayout],
  );

  const accentTheme = useMemo(
    () => sanitizeAccentColor(search.get("accent") || initialAccent),
    [search, initialAccent],
  );

  const placement = useMemo(
    () =>
      sanitizePlacementLabel(
        search.get("placement") ||
          search.get("widgetPlacement") ||
          search.get("widget_placement") ||
          initialPlacement,
      ),
    [search, initialPlacement],
  );

  const companyKey = tour?.company || requestedCompany || "unknown";
  const itemKey = tour ? String(tour.pk) : requestedItem || "unknown";
  const widgetKey = `wta-${companyKey}-${itemKey}`;

  useEffect(() => {
    setImageFailed(false);
  }, [tour?.image]);

  useEffect(() => {
    if (!tour || status !== "active") return;
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
  }, [pathname, status, tour, widgetContext]);

  if (status !== "active" || !tour) {
    const isRetired = status === "retired";
    const unavailableTitle = tour?.title
      ? tour.title
      : isRetired
        ? "Excursion Retired"
        : "Tour Unavailable";
    const portLabel = tour?.port ? getPortDisplayName(tour.port) : null;
    const operatorLabel = (tour?.company || requestedCompany)
      ? getOperatorDisplayName(tour?.company || requestedCompany)
      : null;

    return (
      <main
        data-wta-widget-root
        data-wta-widget-key={widgetKey}
        data-wta-widget-status={status}
        className="w-full bg-transparent p-1 font-sans text-slate-900 antialiased"
      >
        <article
          role="region"
          aria-label={`${unavailableTitle} – unavailable tour notice`}
          className="overflow-hidden rounded-2xl border border-amber-300/90 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
              {isRetired ? "Retired Tour" : "Tour Unavailable"}
            </span>
            {portLabel ? (
              <span className="text-xs font-semibold text-slate-600">{portLabel}</span>
            ) : null}
            {operatorLabel ? (
              <span className="text-xs text-slate-500">· {operatorLabel}</span>
            ) : null}
          </div>

          <h1 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            {unavailableTitle}
          </h1>

          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {reason ||
              "This excursion is no longer available for online booking through Welcome to Alaska Tours."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
            <span className="text-xs font-medium text-slate-500">
              Booking disabled for this item
            </span>
            <a
              href="/tours"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Browse active Alaska tours
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
      </main>
    );
  }

  const portLabel = getPortDisplayName(tour.port);
  const operatorLabel = getOperatorDisplayName(tour.company);
  const duration = formatWidgetDuration(tour);
  const description = formatWidgetDescription(tour);
  const price = formatWidgetPrice(tour, { requireFreshTimestamp: true });
  const hasValidImage = Boolean(tour.image && tour.image.trim() && !imageFailed);

  const bookingPageHref = buildWidgetBookingUrl({
    company: tour.company,
    pk: tour.pk,
    slug: tour.slug,
    port: tour.port,
    placement,
    widgetId: widgetContext.widgetId || widgetKey,
    context: {
      ...widgetContext,
      portSlug: widgetContext.portSlug || canonicalizePortSlug(tour.port),
      productSlug: widgetContext.productSlug || tour.slug,
      widgetPlacement: placement,
    },
  });

  const isCompact = layout === "compact";

  return (
    <main
      data-wta-widget-root
      data-wta-widget-key={widgetKey}
      data-wta-widget-layout={layout}
      data-wta-widget-status="active"
      className="w-full bg-transparent p-1 font-sans text-slate-900 antialiased"
    >
      <article
        role="region"
        aria-label={`${tour.title} – ${portLabel}`}
        className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.06)] ${
          isCompact ? "grid grid-cols-1 sm:grid-cols-[210px_1fr]" : "flex flex-col"
        }`}
      >
        {/* Image or Missing-Image Fallback */}
        <div
          className={`relative overflow-hidden bg-slate-100 ${
            isCompact
              ? "aspect-[16/9] max-h-[140px] sm:aspect-auto sm:max-h-none sm:min-h-[188px]"
              : "aspect-[16/10] max-h-[168px] w-full sm:max-h-[200px]"
          }`}
        >
          {hasValidImage ? (
            <img
              src={tour.image}
              alt={tour.title}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              data-testid="widget-image-fallback"
              className="flex h-full min-h-[148px] w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4 py-6 text-center"
            >
              <span className="rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700">
                {portLabel}
              </span>
              <span className="mt-2 text-xs font-semibold text-slate-600">
                {tour.category || "Alaska Shore Excursion"}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500">
                Photo not provided by operator
              </span>
            </div>
          )}

          {/* Port & Duration Badges over image when image is present */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-1.5 p-3">
            <span className="inline-flex items-center rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              {portLabel}
            </span>
            {duration ? (
              <span
                data-testid="widget-duration-badge"
                className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur-sm"
              >
                {duration}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content Body */}
        <div className={`flex flex-1 flex-col justify-between ${isCompact ? "p-4" : "p-4 sm:p-5"}`}>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>{operatorLabel}</span>
              {duration ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{duration}</span>
                </>
              ) : null}
            </div>

            <h1
              className={`mt-1 font-bold leading-snug tracking-tight text-slate-900 ${
                isCompact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
              }`}
            >
              {tour.title}
            </h1>

            {description ? (
              <p
                className={`mt-2 text-slate-600 ${
                  isCompact
                    ? "line-clamp-2 text-xs leading-relaxed sm:text-sm"
                    : "line-clamp-3 text-sm leading-relaxed"
                }`}
              >
                {description}
              </p>
            ) : null}
          </div>

          {/* Pricing + Primary CTA */}
          <div
            className={`mt-4 border-t border-slate-100 pt-3.5 ${
              isCompact
                ? "flex flex-wrap items-center justify-between gap-3"
                : "flex flex-col gap-3"
            }`}
          >
            <div data-testid="widget-price-block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Price
              </div>
              {price.supported ? (
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900">
                    {price.amountLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {price.currency}
                  </span>
                  {price.basisLabel ? (
                    <span className="text-xs font-medium text-slate-600">
                      · {price.basisLabel}
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="mt-0.5 text-sm font-bold text-slate-800">
                  Check current price
                </div>
              )}
            </div>

            <a
              href={bookingPageHref}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="widget-book-cta"
              style={{
                backgroundColor: accentTheme.hex,
                color: accentTheme.textOnAccent,
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-center text-sm font-bold shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                isCompact ? "shrink-0" : "w-full"
              }`}
            >
              <span>Check dates &amp; book</span>
              <span aria-hidden="true" className="text-xs">
                ↗
              </span>
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}

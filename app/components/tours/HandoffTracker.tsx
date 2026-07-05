"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import { resolveWidgetInitContext } from "@/lib/widgetContext";
import { emitWidgetLifecycleEvent, widgetViewStorageKey } from "@/components/widget/widgetLifecycle";

export default function HandoffTracker({
  port,
  slug,
}: {
  port: string;
  slug: string;
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
      portSlug: widgetContext.portSlug || canonicalizePortSlug(port),
      productSlug: widgetContext.productSlug || slug,
      eventType: "handoff_viewed",
      sourcePath: pathname,
      status: "viewed",
      stage: "widget_rendered",
    }).then(() => {
      if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
    });
  }, [pathname, port, slug, widgetContext]);

  return null;
}

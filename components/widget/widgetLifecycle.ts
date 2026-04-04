"use client";

import type { WidgetInitContext } from "@/lib/widgetContext";

type WidgetLifecycleInput = WidgetInitContext & {
  eventType: string;
  sourcePath: string;
  status?: string;
  stage?: string;
  message?: string;
  externalReference?: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  email?: string;
  name?: string;
  partySize?: number;
};

export async function emitWidgetLifecycleEvent(input: WidgetLifecycleInput) {
  if (!input.handoffId || input.source !== "dcc") return;

  await fetch("/api/widget/lifecycle", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    keepalive: true,
  }).catch(() => undefined);
}

export function widgetViewStorageKey(handoffId: string, sourcePath: string, widgetId?: string) {
  return `wta_widget_view:${handoffId}:${sourcePath}:${widgetId || "default"}`;
}

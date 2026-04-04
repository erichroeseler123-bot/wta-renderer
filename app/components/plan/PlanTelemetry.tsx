"use client";

import { useEffect, useRef } from "react";
import type { PlanEvent } from "@/lib/planTelemetry";

type Impression = {
  productSlug: string;
  rank: number;
};

type Props = {
  base: Omit<PlanEvent, "event" | "productSlug" | "rank">;
  impressions: Impression[];
};

function sendEvent(payload: PlanEvent & { path?: string }) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/plan-events", blob);
    return;
  }

  void fetch("/api/plan-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export default function PlanTelemetry({ base, impressions }: Props) {
  const sentImpressionRef = useRef(false);

  useEffect(() => {
    if (sentImpressionRef.current) return;
    sentImpressionRef.current = true;

    sendEvent({ ...base, event: "requested_lane", path: "/plan" });
    sendEvent({
      ...base,
      event: "resolved_lane",
      path: "/plan",
      reason: base.reason,
      degradedFallback: base.degradedFallback,
    });

    impressions.forEach((impression) => {
      sendEvent({
        ...base,
        event: "shortlist_impression",
        path: "/plan",
        productSlug: impression.productSlug,
        rank: impression.rank,
      });
    });
  }, [base, impressions]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const anchor = target.closest<HTMLAnchorElement>("[data-plan-click]");
      if (!anchor) return;

      const productSlug = anchor.dataset.productSlug || undefined;
      const rank = anchor.dataset.rank ? Number(anchor.dataset.rank) : undefined;
      const nextStep = anchor.dataset.nextStep || undefined;

      sendEvent({
        ...base,
        event: "shortlist_click",
        path: "/plan",
        productSlug,
        rank,
        reason: nextStep,
      });

    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [base]);

  return null;
}

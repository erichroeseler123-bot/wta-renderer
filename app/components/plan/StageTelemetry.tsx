"use client";

import { useEffect, useRef } from "react";
import type { PlanEvent } from "@/lib/planTelemetry";

type Props = {
  payload: PlanEvent;
  enabled?: boolean;
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

export default function StageTelemetry({ payload, enabled = true }: Props) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!enabled || sentRef.current) return;
    sentRef.current = true;
    sendEvent(payload);
  }, [enabled, payload]);

  return null;
}

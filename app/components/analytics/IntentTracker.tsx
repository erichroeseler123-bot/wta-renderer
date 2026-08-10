"use client";

import { useEffect } from "react";

function classifyLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") || "";
  const text = (anchor.textContent || "").trim().slice(0, 120);

  if (href.startsWith("tel:")) {
    return { event: "phone_click", href, text };
  }

  if (
    href.includes("/checkout") ||
    href.includes("/calendar") ||
    href.includes("fareharbor.com") ||
    /book|checkout|reserve|availability|calendar/i.test(text)
  ) {
    return { event: "booking_intent_click", href, text };
  }

  return null;
}

export default function IntentTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const payload = classifyLink(anchor);
      if (!payload) return;

      const body = JSON.stringify({
        ...payload,
        path: window.location.pathname,
        search: window.location.search,
        ts: new Date().toISOString(),
      });

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/intent-event", new Blob([body], { type: "application/json" }));
        } else {
          void fetch("/api/intent-event", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
            keepalive: true,
          });
        }
      } catch {
        // Tracking must never block navigation or booking.
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

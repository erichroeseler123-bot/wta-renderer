"use client";

import { useEffect } from "react";

export default function BackForwardRefresh() {
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    const navEntries = performance.getEntriesByType("navigation");
    const navigationEntry = navEntries[0] as PerformanceNavigationTiming | undefined;
    if (navigationEntry?.type === "back_forward") {
      window.location.reload();
    }

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}

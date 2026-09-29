"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, flushGAQueue } from "@/lib/analytics/ga";

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      if (process.env.NODE_ENV === "development") {
        console.info(
          "[GA4] NEXT_PUBLIC_GA_MEASUREMENT_ID is not configured. Event queueing is active.",
        );
      }
      return;
    }

    // Flush any early events when window.gtag becomes ready
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      flushGAQueue();
    }
  }, []);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={() => {
          flushGAQueue();
        }}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: true,
              transport_type: 'beacon'
            });
          `,
        }}
      />
    </>
  );
}

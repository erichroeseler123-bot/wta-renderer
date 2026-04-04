"use client";

import { useEffect } from "react";

export default function WidgetResizeReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const postHeight = () => {
      const bodyHeight = document.body.scrollHeight;
      const rootHeight = document.documentElement.scrollHeight;
      const height = Math.max(bodyHeight, rootHeight, 320);

      window.parent.postMessage(
        {
          type: "wta-widget:resize",
          height,
          href: window.location.href,
        },
        "*",
      );
    };

    postHeight();

    const observer = new ResizeObserver(() => {
      postHeight();
    });

    observer.observe(document.body);
    observer.observe(document.documentElement);
    window.addEventListener("load", postHeight);

    const timeout = window.setTimeout(postHeight, 400);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", postHeight);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}

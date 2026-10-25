"use client";

import { useEffect } from "react";

export default function WidgetResizeReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const postHeight = () => {
      const widgetRoot = document.querySelector<HTMLElement>("[data-wta-widget-root]");
      let height: number;
      let widgetKey: string | undefined;

      if (widgetRoot) {
        const rectHeight = Math.ceil(widgetRoot.getBoundingClientRect().height);
        const scrollHeight = Math.ceil(widgetRoot.scrollHeight);
        height = Math.max(rectHeight, scrollHeight, 150);
        widgetKey = widgetRoot.getAttribute("data-wta-widget-key") || undefined;
      } else {
        const bodyHeight = document.body.scrollHeight;
        const rootHeight = document.documentElement.scrollHeight;
        height = Math.max(bodyHeight, rootHeight, 320);
      }

      window.parent.postMessage(
        {
          type: "wta-widget:resize",
          height,
          widgetKey,
          href: window.location.href,
        },
        "*",
      );
    };

    postHeight();

    const observer = new ResizeObserver(() => {
      postHeight();
    });

    const widgetRoot = document.querySelector<HTMLElement>("[data-wta-widget-root]");
    if (widgetRoot) {
      observer.observe(widgetRoot);
    }
    observer.observe(document.body);
    observer.observe(document.documentElement);
    window.addEventListener("load", postHeight);
    window.addEventListener("resize", postHeight);

    const timeout = window.setTimeout(postHeight, 350);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", postHeight);
      window.removeEventListener("resize", postHeight);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}

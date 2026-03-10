"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
    };
  }
}

export default function TurnstileWidget(props: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current) return;
    if (!ref.current) return;
    if (!window.turnstile) return;

    window.turnstile.render(ref.current, {
      sitekey: props.siteKey,
      callback: (token) => props.onToken(token),
      "expired-callback": () => props.onToken(""),
      "error-callback": () => props.onToken(""),
    });
    rendered.current = true;
  }, [props]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={ref} />
    </div>
  );
}

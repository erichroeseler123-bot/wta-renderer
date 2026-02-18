"use client";
import { useEffect, useState } from "react";

export default function FromPrice({
  company,
  item,
  initial,
}: {
  company: string;
  item: string | number;
  initial?: string | null;
}) {
  const [label, setLabel] = useState<string>(initial || "Check Price");

  useEffect(() => {
    if (initial) return;
    let alive = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/fareharbor/price?company=${encodeURIComponent(company)}&item=${encodeURIComponent(String(item))}`,
          { cache: "no-store" }
        );
        const j = await res.json();
        if (!alive) return;
        if (j?.ok && j?.fromDisplay) setLabel(`From ${j.fromDisplay}`);
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, [company, item, initial]);

  return <>{label}</>;
}

"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

export default function InteractiveMap({ lat, lon }: { lat: number; lon: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY!;
    const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;

    const map = new maplibregl.Map({
      container: ref.current,
      style: styleUrl,
      center: [lon, lat],
      zoom: 15,
      pitch: 55,     // angle
      bearing: -25,  // rotate slightly
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    new maplibregl.Marker({ color: "#4CC9F0" })
      .setLngLat([lon, lat])
      .addTo(map);

    return () => map.remove();
  }, [lat, lon]);

  return <div ref={ref} className="h-[420px] w-full overflow-hidden rounded-2xl" />;
}

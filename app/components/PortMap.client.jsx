"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function PortMap() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const bounds = [
      [-134.48, 58.27], // SW (expanded)
      [-134.32, 58.35], // NE (expanded)
    ];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      bearing: 49,
      pitch: 0,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "bottom-left");

    map.on("load", () => {
      map.fitBounds(bounds, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        bearing: 49,
        duration: 0,
      });

      // Visual tuning
      if (map.getLayer("water")) {
        map.setPaintProperty("water", "fill-color", "#2b5c8a");
      }
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0 }}
    />
  );
}

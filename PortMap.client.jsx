"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function PortMap({ center }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center,
      zoom: 10,
      interactive: true,
    });

    return () => mapRef.current?.remove();
  }, [center]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,              // stays under HUD + content
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "auto", // map works
        }}
      />
    </div>
  );
}

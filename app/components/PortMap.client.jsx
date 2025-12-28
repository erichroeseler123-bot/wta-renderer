"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function PortMap({ slug }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current, // 🔒 LOCKED CONTAINER
      style: "https://demotiles.maplibre.org/style.json",
      center: [-134.4197, 58.3019], // Juneau
      zoom: 10,
      pitch: 0,
      bearing: 0,
      attributionControl: true
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden"
      }}
    />
  );
}

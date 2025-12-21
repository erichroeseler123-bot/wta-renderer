"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function JuneauLiveMap({ className = "" }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;

    const style = {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }],
    };

    const map = new maplibregl.Map({
      container: elRef.current,
      style,
      center: [-134.4197, 58.3019],
      zoom: 13.7,
      pitch: 58,
      bearing: -35,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    let raf = 0;
    const spin = () => {
      map.rotateTo(map.getBearing() + 0.06, { duration: 0 });
      raf = requestAnimationFrame(spin);
    };

    map.on("load", () => {
      raf = requestAnimationFrame(spin);
    });

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={elRef} className={className} />;
}

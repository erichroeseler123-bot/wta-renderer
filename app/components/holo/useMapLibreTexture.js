"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import maplibregl from "maplibre-gl";

export function useMapLibreTexture({
  style,
  center = [-134.4197, 58.3019],
  zoom = 14.6,
  bearing = 0,
  pitch = 0,
  width = 1280,
  height = 800,
  debug = false,
}) {
  const mapRef = useRef(null);
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.pointerEvents = "none";

    if (debug) {
      // show it on-screen so we can verify it actually renders
      el.style.left = "16px";
      el.style.bottom = "16px";
      el.style.opacity = "1";
      el.style.zIndex = "9999";
      el.style.border = "1px solid rgba(0,255,255,0.35)";
      el.style.borderRadius = "12px";
      el.style.overflow = "hidden";
      el.style.boxShadow = "0 20px 80px rgba(0,0,0,0.6)";
      el.style.width = "420px";
      el.style.height = "260px";
    } else {
      // offscreen but still renderable
      el.style.left = "0";
      el.style.top = "0";
      el.style.opacity = "0.001";
      el.style.zIndex = "-9999";
    }

    document.body.appendChild(el);

    const map = new maplibregl.Map({
      container: el,
      style,
      center,
      zoom,
      bearing,
      pitch,
      interactive: false,
      attributionControl: false,
      preserveDrawingBuffer: true,
      antialias: true,
      renderWorldCopies: false,
    });

    mapRef.current = map;

    map.on("error", (e) => console.log("[MapLibre error]", e?.error || e));
    map.on("load", () => {
      map.resize();

      const canvas = map.getCanvas();
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;

      // Wait for tiles to actually draw at least once
      map.once("idle", () => {
        setTexture(tex);
      });

      // keep map repainting
      const timer = setInterval(() => {
        try { map.triggerRepaint(); } catch {}
      }, 33);

      map.__holoTimer = timer;
    });

    return () => {
      try { clearInterval(map.__holoTimer); } catch {}
      try { map.remove(); } catch {}
      try { el.remove(); } catch {}
    };
  }, [style, center?.[0], center?.[1], zoom, bearing, pitch, width, height, debug]);

  return { texture, map: mapRef.current };
}

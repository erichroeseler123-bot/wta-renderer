'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export default function PortMapClient({ center }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/darkmatter/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center,
      zoom: 10,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
      }}
    />
  );
}

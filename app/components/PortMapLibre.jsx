'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function PortMapLibre({ center }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center,
      zoom: 9,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => map.remove();
  }, [center]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#000',
      }}
    />
  );
}

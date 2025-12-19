'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useRouter } from 'next/navigation';
import 'maplibre-gl/dist/maplibre-gl.css';

const PORTS = [
  { slug: 'juneau', name: 'Juneau', lat: 58.3019, lng: -134.4197 },
  { slug: 'skagway', name: 'Skagway', lat: 59.4583, lng: -135.3139 },
  { slug: 'ketchikan', name: 'Ketchikan', lat: 55.3422, lng: -131.6461 },
  { slug: 'sitka', name: 'Sitka', lat: 57.0531, lng: -135.3300 },
];

export default function AlaskaMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-136, 57],
      zoom: 4,
      pitch: 45,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    PORTS.forEach((port) => {
      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.background = '#00d4ff';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 12px rgba(0,212,255,0.8)';

      el.onmouseenter = () => {
        el.style.transform = 'scale(1.3)';
      };

      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
      };

      el.onclick = () => {
        router.push(`/ports/${port.slug}`);
      };

      new maplibregl.Marker(el)
        .setLngLat([port.lng, port.lat])
        .addTo(map);
    });

    return () => map.remove();
  }, [router]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '520px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
}

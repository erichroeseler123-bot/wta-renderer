'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function DCCPortMap({ center }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: center ?? [-134.4197, 58.3019], // Juneau fallback
      zoom: 9,
      pitch: 55,
      bearing: -20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center]);

  return (
    <div style={styles.wrapper}>
      <div ref={containerRef} style={styles.map} />
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'absolute',
    inset: 0,
    minHeight: '480px',
    background: '#05070c', // DEBUG BACKGROUND (you should see this)
  },
  map: {
    width: '100%',
    height: '100%',
  },
};

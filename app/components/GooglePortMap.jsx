'use client';

import { useEffect, useRef, useState } from 'react';

export default function GooglePortMap({ lat, lng, zoom = 11, slug = 'juneau' }) {
  const mapRef = useRef(null);
  const [isInteractive, setIsInteractive] = useState(false);

  const apiKey = 'AIzaSyAvqzPbald4nwiZmNd86kh8p2XpwH63KdE';

  const staticImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=1200x800&maptype=terrain&key=${apiKey}`;

  useEffect(() => {
    const loadScript = () => {
      if (window.google?.maps) {
        initMap();
        return;
      }

      if (document.getElementById('google-maps-script')) {
        const check = () => {
          if (window.google?.maps) initMap();
          else requestAnimationFrame(check);
        };
        check();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || isInteractive) return;

      new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom,
        mapTypeId: 'terrain',
        disableDefaultUI: true,
      });
      setIsInteractive(true);
    };

    loadScript();
  }, [lat, lng, zoom]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img src={staticImageUrl} alt={`Terrain map of ${slug}`} style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: isInteractive ? 0 : 1,
        transition: 'opacity 1s ease',
        zIndex: 1,
      }} />
      <div ref={mapRef} style={{
        position: 'absolute',
        inset: 0,
        opacity: isInteractive ? 1 : 0,
        transition: 'opacity 1s ease',
        zIndex: 2,
      }} />
    </div>
  );
}

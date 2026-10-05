"use client";
import { useEffect, useRef, useState } from 'react';

export default function GooglePortMap({ lat = 58.3019, lng = -134.4197, slug = "juneau" }) {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const apiKey = "YOUR_API_KEY";

  useEffect(() => {
    async function init3DMap() {
      // 1. Load the alpha 3D library
      if (!window.google || !window.google.maps) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=alpha&libraries=maps3d`;
        script.async = true;
        script.onload = () => build3D();
        document.head.appendChild(script);
      } else {
        build3D();
      }

      async function build3D() {
        // 2. Import the 3D library components
        const { Map3DElement } = await google.maps.importLibrary("maps3d");
        
        // 3. Clear existing content to prevent duplicates
        if (containerRef.current) containerRef.current.innerHTML = '';

        // 4. Create the 3D Element
        const map3D = new Map3DElement({
          center: { lat, lng, altitude: 800 }, // Altitude adds the 3D perspective
          tilt: 65,    // This gets rid of the "birds eye" flat look
          range: 2000, // Distance from the center point
          heading: 0,  // Compass direction
        });

        containerRef.current.appendChild(map3D);
        setIsLoaded(true);
      }
    }

    init3DMap();
  }, [lat, lng]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {!isLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
           Hydrating 3D Port Environment...
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Cinematic Overlay */}
      <div style={{ position: 'absolute', bottom: '40px', left: '40px', zIndex: 20, pointerEvents: 'none' }}>
        <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
          {slug}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Live Spatial Overview
        </p>
      </div>
    </div>
  );
}

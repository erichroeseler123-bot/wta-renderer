'use client';

import { useEffect, useState } from 'react';

export default function DCCRotatingMap({ slug }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBlocked(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (blocked) {
    return (
      <div style={styles.fallback}>
        <div style={styles.fallbackOverlay}>
          <h2 style={styles.title}>DCC Map</h2>
          <p style={styles.subtitle}>
            Live map view for {slug.charAt(0).toUpperCase() + slug.slice(1)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <iframe
        src={`https://destinationcommandcenter.com/embed/map?port=${slug}`}
        style={styles.iframe}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBlocked(true)}
      />
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    background: '#000',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },

  /* Fallback (when iframe blocked) */
  fallback: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'url(https://images.unsplash.com/photo-1549880338-65ddcdfd017b)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  fallbackOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(11,14,20,0.95), rgba(11,14,20,0.3))',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 40,
    color: '#e6e9ef',
  },
  title: {
    fontSize: 36,
    marginBottom: 6,
  },
  subtitle: {
    color: '#c9d1ff',
  },
};

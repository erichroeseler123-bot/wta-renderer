"use client";

export default function JuneauViewport({ className = "", src = "", enabled = false }) {
  // If we don't have a token, DON'T mount the iframe.
  // That way the Juneau backdrop image is always visible.
  if (!enabled) {
    return (
      <div className={className}>
        <div className="juneauNoToken">
          Missing Cesium token. Paste it into <code>app/ports/juneau/page.jsx</code> to enable 3D.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe className="juneauCesium" src={src} title="Juneau 3D" />
    </div>
  );
}

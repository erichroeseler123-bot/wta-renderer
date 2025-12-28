"use client";

import { useEffect, useState } from "react";

export default function HoloIntro({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3500); // 3.5s intro

    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at center, #0ff2, #000 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "#0ff",
        fontFamily: "monospace",
        letterSpacing: 2,
      }}
    >
      <div style={{ textAlign: "center", animation: "pulse 1.8s infinite" }}>
        <div style={{ fontSize: 32 }}>EARTHOS</div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>
          INITIALIZING GEO HUD
        </div>
      </div>
    </div>
  );
}

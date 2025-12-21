"use client";

import { useParams } from "next/navigation";

const NODES = {
  juneau: {
    label: "JUNEAU TERMINAL",
    coord: "58.3019° N, 134.4197° W // LOCKED VIEW",
    bgImage: "https://idsb.tmgrup.com.tr/ly/uploads/images/2023/08/06/286220.jpg", // ← replace with your favorite from above
  },
};

export default function PortHUDStatic() {
  const { slug } = useParams();
  const node = NODES[slug] || NODES.juneau;

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#000", display: "flex", overflow: "hidden" }}>
      <div style={{ width: "40%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{
          flex: "1 1 0",
          minHeight: 0,
          backgroundImage: `url(${node.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          filter: "brightness(0.75) contrast(1.15) saturate(1.3)",
        }} />

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(0,255,255,0.10) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.92) 100%)", mixBlendMode: "screen", opacity: 0.9 }} />
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,255,255,0.00) 0px, rgba(0,255,255,0.00) 2px, rgba(0,255,255,0.055) 3px, rgba(0,255,255,0.00) 4px)", opacity: 0.22 }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: 0.85 }}>
            <div style={{ width: 140, height: 140, border: "1px solid rgba(0,255,255,0.25)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 16, height: 16, transform: "translate(-50%,-50%)" }}>
              <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(0,255,255,0.65)" }} />
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 4, height: 4, transform: "translate(-50%,-50%)", background: "rgba(0,255,255,0.9)" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 14, top: 14, width: 160, height: 90, borderLeft: "1px solid rgba(0,255,255,0.35)", borderTop: "1px solid rgba(0,255,255,0.35)" }} />
          <div style={{ position: "absolute", right: 14, top: 14, width: 160, height: 90, borderRight: "1px solid rgba(0,255,255,0.35)", borderTop: "1px solid rgba(0,255,255,0.35)" }} />
          <div style={{ position: "absolute", left: 14, bottom: 14, width: 160, height: 90, borderLeft: "1px solid rgba(0,255,255,0.35)", borderBottom: "1px solid rgba(0,255,255,0.35)" }} />
          <div style={{ position: "absolute", right: 14, bottom: 14, width: 160, height: 90, borderRight: "1px solid rgba(0,255,255,0.35)", borderBottom: "1px solid rgba(0,255,255,0.35)" }} />
        </div>

        <div style={{ height: "60%", background: "rgba(0, 10, 20, 0.85)", borderTop: "1px solid rgba(0, 255, 255, 0.3)", padding: "2rem", color: "#00ffff", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", textShadow: "0 0 10px rgba(0,255,255,0.3)" }}>
          <div style={{ fontSize: "2.4rem", fontWeight: 900, letterSpacing: "0.1em" }}>{node.label}</div>
          <div style={{ fontSize: "1rem", opacity: 0.8, letterSpacing: "0.3em", margin: "1rem 0 2rem" }}>{node.coord}</div>
          <div style={{ fontSize: "1rem", lineHeight: "2", letterSpacing: "0.15em" }}>
            TARGET ZONE: DOWNTOWN JUNEAU + CRUISE DOCKS<br />
            STATUS: LOCKED // SCAN COMPLETE
          </div>
          <div style={{ marginTop: "auto", fontSize: "0.8rem", opacity: 0.5, letterSpacing: "0.2em" }}>
            STATIC HOLOGRAPHIC PROJECTION // TERMINAL ACTIVE
          </div>
        </div>
      </div>

      <div style={{ width: "60%", height: "100%", background: "#000" }} />
    </div>
  );
}

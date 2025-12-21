"use client";

import { useParams } from "next/navigation";

const NODES = {
  juneau: {
    label: "JUNEAU TERMINAL",
    coord: "58.3019° N, 134.4197° W // LOCKED VIEW",
    bgImage: "https://idsb.tmgrup.com.tr/ly/uploads/images/2023/08/06/284689.jpg",
  },
  skagway: {
    label: "SKAGWAY TERMINAL",
    coord: "59.4583° N, 135.3139° W // LOCKED VIEW",
    bgImage: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Skagway_Alaska_harbor.jpg",
  },
};

export default function PortHUDStatic() {
  const { slug } = useParams();
  const node = NODES[slug];

  if (!node) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "#000",
          color: "#0ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: "1.2rem",
          letterSpacing: "0.15em",
          textAlign: "center",
        }}
      >
        DCC HUD ONLINE<br />
        UNKNOWN NODE: {slug}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", background: "#000", color: "#fff" }}>
      <div style={{ width: "40%", height: "100%", position: "relative" }}>
        <div
          style={{
            height: "100%",
            backgroundImage: `url(${node.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.75) contrast(1.15) saturate(1.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.9))",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            fontFamily: "monospace",
          }}
        >
          <div style={{ fontSize: "2.4rem", fontWeight: 900 }}>{node.label}</div>
          <div style={{ fontSize: "1rem", opacity: 0.8 }}>{node.coord}</div>
          <div style={{ marginTop: 12, fontSize: "0.9rem", lineHeight: 1.6 }}>
            TARGET ZONE: PORT + DOWNTOWN<br />
            STATUS: LOCKED // SCAN COMPLETE
          </div>
        </div>
      </div>

      <div
        style={{
          width: "60%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: "1.1rem",
          letterSpacing: "0.12em",
          color: "#0ff",
        }}
      >
        MAP / CESIUM / OVERLAY SLOT
      </div>
    </div>
  );
}

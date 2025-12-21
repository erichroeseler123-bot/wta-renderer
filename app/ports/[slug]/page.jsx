"use client";

import { useParams } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const NODES = {
  juneau: {
    label: "JUNEAU TERMINAL",
    coord: "58.3019° N, 134.4197° W",
    bg: "#020b1a",
  },
  skagway: {
    label: "SKAGWAY TERMINAL",
    coord: "59.4583° N, 135.3139° W",
    bg: "#020b1a",
  },
};

export default function PortHUD() {
  const { slug } = useParams();
  const node = NODES[slug];

  if (!node) {
    return (
      <div style={{ height: "100vh", background: "#000", color: "#0ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
        HUD ONLINE — UNKNOWN PORT: {slug}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: node.bg, color: "#0ff", padding: 40, fontFamily: "monospace" }}>
      <h1>{node.label}</h1>
      <p>{node.coord}</p>
      <p>STATUS: HUD ACTIVE</p>
    </div>
  );
}

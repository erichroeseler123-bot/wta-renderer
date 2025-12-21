"use client";

const COLORS = {
  dock: "#00ffff",
  pickup: "#00ff6a",
  landmark: "#ffd166"
};

export default function POIOverlay({ poi }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {poi.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.screen.x}%`,
            top: `${p.screen.y}%`,
            transform: "translate(-50%, -50%)",
            color: COLORS[p.type] || "#fff",
            fontSize: "0.8rem",
            fontWeight: 900,
            textShadow: "0 0 10px rgba(0,0,0,1)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <div style={{ 
            width: "10px", height: "10px", borderRadius: "50%", 
            background: COLORS[p.type], boxShadow: `0 0 10px ${COLORS[p.type]}` 
          }} />
          {p.label}
        </div>
      ))}
    </div>
  );
}

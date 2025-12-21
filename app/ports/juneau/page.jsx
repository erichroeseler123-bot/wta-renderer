"use client";

import JuneauViewport from "./JuneauViewport";
import { useMemo } from "react";

export default function JuneauPage() {
  // Default start camera (tweak these)
  const cam = {
    lon: -134.45951,
    lat: 58.28174,
    alt: 1800,      // lower = more zoom-in
    heading: 180,   // degrees (180 = flipped)
    pitch: -35,     // degrees (negative looks down)
    roll: 0
  };

  // Put your Cesium ion token here ONCE you have it.
  // (Or keep empty and pass via query later.)
    const token = (process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || ""); // set in .env.local / Vercel
  const tokenEnabled = Boolean(token);

  const cesiumSrc = useMemo(() => {
    const base = "/juneau-holo/index.html";
    const qs = `?token=${encodeURIComponent(token)}`
      + `&lon=${cam.lon}&lat=${cam.lat}&alt=${cam.alt}`
      + `&heading=${cam.heading}&pitch=${cam.pitch}&roll=${cam.roll}`;
    return base + qs;
  }, [token]);

  const locations = [
    { id: "dock", name: "Cruise Dock Terminal", tag: "PORT" },
    { id: "downtown", name: "Downtown Juneau", tag: "CORE" },
    { id: "mendenhall", name: "Mendenhall Glacier", tag: "ICON" },
    { id: "whales", name: "Whale Watching Zone", tag: "WATER" },
  ];

  return (
    <div className="holoPage">
      <div className="holoHudTop">
        <div className="holoHudLeft">
          <div className="holoBadge">DCC • WTA</div>
          <div className="holoTitle">Juneau Port Overlay</div>
          <div className="holoMeta">LOCKED VIEW • INTERACTIVE TARGETS • MONETIZED ENDPOINT</div>
        </div>

        <div className="holoHudRight">
          <div className="holoStat">
            <div className="holoStatLabel">NODE</div>
            <div className="holoStatValue">JNU-01</div>
          </div>
          <div className="holoStat">
            <div className="holoStatLabel">STATUS</div>
            <div className="holoStatValue">LIVE</div>
          </div>
          <div className="holoStat">
            <div className="holoStatLabel">FOCUS</div>
            <div className="holoStatValue">PORT</div>
          </div>
        </div>
      </div>

      <div className="holoStage">
        <div className="holoMapFrame">
          <div className="holoFrameEdge" />
          <img className="holoBackdrop" src="/media/juneau-aerial.png" alt="" />
          <JuneauViewport className="juneauViewport" src={cesiumSrc} enabled={tokenEnabled} />
          <div className="holoGlass holoBg" />
          <div className="holoScanlines" />
        </div>

        <aside className="holoSide">
          <div className="holoSideHeader">
            <div className="holoSideTitle">Tour Locations</div>
            <div className="holoSideSub">Hover to target • click later to open tour cards</div>
          </div>

          <div className="holoList">
            {locations.map((loc) => (
              <div key={loc.id} className="holoItem">
                <div className="holoItemLeft">
                  <div className="holoDot" />
                  <div className="holoItemName">{loc.name}</div>
                </div>
                <div className="holoTag">{loc.tag}</div>
              </div>
            ))}
          </div>

          <div className="holoCta">
            <button className="holoPrimary">Explore Juneau Tours</button>
            <div className="holoFinePrint">This is where your booking widgets / cart hooks live.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

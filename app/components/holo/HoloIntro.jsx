"use client";

import { useEffect, useState } from "react";

export default function HoloIntro({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 450);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => {
      setPhase(3);
      onDone?.();
    }, 1900);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`holoIntro ${phase >= 3 ? "off" : ""}`}>
      <div className="holoIntroGrid" />
      <div className="holoIntroScan" />
      <div className="holoIntroCenter">
        <div className={`holoIntroKicker ${phase >= 1 ? "on" : ""}`}>DCC NODE / ALASKA</div>
        <h1 className={`holoIntroTitle ${phase >= 1 ? "on" : ""}`}>Welcome to Alaska Tours</h1>
        <div className={`holoIntroSub ${phase >= 2 ? "on" : ""}`}>
          INITIALIZING HOLOGRAPHIC DISPLAY • SYNCING PORT LAYERS • LOCKING JUNEAU
        </div>
        <div className={`holoIntroBar ${phase >= 2 ? "on" : ""}`}>
          <div className="holoIntroFill" />
        </div>
      </div>
    </div>
  );
}

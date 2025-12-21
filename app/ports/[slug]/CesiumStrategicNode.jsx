"use client";
import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function CesiumStrategicNode() {
  const containerRef = useRef(null);

  useEffect(() => {
    // REQUIRED: Cesium asset base
    window.CESIUM_BASE_URL = "/cesium";

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: Cesium.createWorldTerrain(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      selectionIndicator: false,
      scene3DOnly: true
    });

    viewer.scene.backgroundColor = Cesium.Color.BLACK;
    viewer.scene.globe.enableLighting = true;

    const TARGET = Cesium.Cartesian3.fromDegrees(
      -134.4197,
      58.3019,
      0
    );

    viewer.camera.lookAt(
      TARGET,
      new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(25),   // natural oblique
        Cesium.Math.toRadians(-35),
        12000                         // ~7.5 miles
      )
    );

    // Subtle strategic drift
    viewer.clock.onTick.addEventListener(() => {
      viewer.camera.rotateLeft(0.00015);
    });

    return () => viewer.destroy();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />

      {/* HUD */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          zIndex: 10,
          pointerEvents: "none"
        }}
      >
        <h1 style={{ color: "#00ffff", fontSize: "1.8rem", fontWeight: 900 }}>
          STRATEGIC GLIDE
        </h1>
        <p style={{ color: "rgba(0,255,255,0.6)", fontSize: "0.7rem", letterSpacing: "0.4em" }}>
          CESIUM // WEEKLY UPDATE
        </p>
      </div>
    </div>
  );
}

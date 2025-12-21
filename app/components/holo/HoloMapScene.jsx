"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import "./HoloMaterial";
import { RasterDarkStyle } from "./rasterDarkStyle";

function HoloBackground({ hoverUvRef, hoverOnRef }) {
  const matRef = useRef();
  const tex = useRef(null);

  if (!tex.current) {
    const t = new THREE.DataTexture(new Uint8Array([10, 16, 22, 255]), 1, 1, THREE.RGBAFormat);
    t.needsUpdate = true;
    tex.current = t;
  }

  useFrame((_, dt) => {
    if (!matRef.current) return;
    matRef.current.uTime += dt;

    const target = hoverOnRef.current ? 1 : 0;
    matRef.current.uHover = THREE.MathUtils.lerp(matRef.current.uHover, target, 0.10);
    matRef.current.uHoverUv.set(hoverUvRef.current.x, hoverUvRef.current.y);

    // IMPORTANT: keep this low so it doesn't wash out the map
    matRef.current.uIntensity = 0.18;
  });

  return (
    <mesh>
      <planeGeometry args={[1.8, 1.1, 1, 1]} />
      <holoMaterial
        ref={matRef}
        uTexture={tex.current}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function HoloMapScene({
  hoverUvRef,
  hoverOnRef,
  center = [-134.409, 58.300],
  zoom = 15.2,
  bearing = 0,
  pitch = 55,
}) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapDivRef.current) return;
    try { mapRef.current?.remove(); } catch {}

    const map = new maplibregl.Map({
      container: mapDivRef.current,
      style: RasterDarkStyle,
      center,
      zoom,
      bearing,
      pitch,
      interactive: false,
      attributionControl: false,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      setTimeout(() => {
        try { map.resize(); } catch {}
      }, 50);
    });

    return () => {
      try { map.remove(); } catch {}
    };
  }, [center?.[0], center?.[1], zoom, bearing, pitch]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 1) Optional scenic photo (behind everything) */}
      <div className="holoBgPhoto" />

      {/* 2) HOLO BACKGROUND @ 10% opacity */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.10, pointerEvents: "none" }}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 1.7], fov: 40 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.6} />
          <HoloBackground hoverUvRef={hoverUvRef} hoverOnRef={hoverOnRef} />
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.55} luminanceThreshold={0.2} luminanceSmoothing={0.35} />
            <ChromaticAberration offset={[0.00045, 0.0002]} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.18} darkness={0.85} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* 3) REAL MAP ON TOP */}
      <div
        ref={mapDivRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "#05080c",
          filter: "contrast(1.12) saturate(1.05) brightness(0.98)",
        }}
      />

      {/* 4) Optional HUD ART overlay @ 10% */}
      <div className="holoHudArt" />
    </div>
  );
}

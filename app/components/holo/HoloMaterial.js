"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uHoverUv;
  uniform float uHover;
  uniform float uIntensity;
  uniform sampler2D uTexture;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;

    vec2 m = (uMouse - 0.5) * 0.020 * uIntensity;

    float scan = sin((uv.y * 900.0) + uTime * 10.0) * 0.035;
    float scan2 = sin((uv.y * 240.0) - uTime * 4.0) * 0.02;

    float n = noise(uv * vec2(420.0, 240.0) + uTime * 0.2);
    float flicker = (step(0.985, fract(n + uTime * 0.6)) * 0.25);

    vec2 ca = vec2(0.0035, 0.0) * (0.25 + n) * uIntensity;
    vec4 tR = texture2D(uTexture, uv + m + ca);
    vec4 tG = texture2D(uTexture, uv + m);
    vec4 tB = texture2D(uTexture, uv + m - ca);

    vec3 tex = vec3(tR.r, tG.g, tB.b);

    float luma = dot(tex, vec3(0.299, 0.587, 0.114));
    vec3 holo = mix(vec3(luma), tex, 0.55);
    holo = mix(holo, vec3(0.10, 0.85, 1.25), 0.70);

    float d = length(uv - 0.5);
    float fres = pow(smoothstep(0.55, 0.95, d), 2.0);
    vec3 edgeGlow = vec3(0.05, 0.7, 1.2) * fres * 1.8;

    float dist = length(uv - uHoverUv);
    float ripple = sin(dist * 80.0 - uTime * 16.0) * exp(-dist * 10.0);
    vec3 hoverGlow = vec3(0.10, 0.9, 1.5) * (ripple * 0.65 + exp(-dist * 16.0) * 0.65) * uHover;

    float jitter = (noise(vec2(uTime * 6.0, uv.y * 80.0)) - 0.5) * 0.012 * uIntensity;
    holo += jitter;

    holo += scan + scan2;
    holo += edgeGlow;
    holo += hoverGlow;
    holo += flicker;

    float vign = smoothstep(0.95, 0.35, d);
    holo *= vign;

    float alpha = (0.72 + scan * 2.0 + flicker) * (0.85 + uHover * 0.15);

    gl_FragColor = vec4(holo, alpha);
  }
`;

export const HoloMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0.5, 0.5),
    uHoverUv: new THREE.Vector2(-10, -10),
    uHover: 0,
    uIntensity: 1,
    uTexture: null,
  },
  vertexShader,
  fragmentShader
);

extend({ HoloMaterial });

"use client";

import { useEffect, useState } from "react";

type WeatherNowData = {
  fetchedAt: string;
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
  };
};

export default function WeatherNow({ lat, lon }: { lat: number; lon: number }) {
  const [data, setData] = useState<WeatherNowData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => r.json())
      .then((j) => !cancelled && setData(j))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (!data?.current) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85">
      <span>🌤️</span>
      <span>{Math.round(data.current.temperature_2m)}°F</span>
      <span className="text-white/40">·</span>
      <span>{Math.round(data.current.wind_speed_10m)} mph</span>
    </div>
  );
}

import React from "react";
import type { AlaskaGeoFact } from "@/lib/alaskaGeoFacts";

export interface GeoDirectAnswerCardProps {
  fact?: AlaskaGeoFact | null;
  customQuestion?: string;
  customAnswer?: string;
  pricingLabel?: string;
  pricingValue?: string;
  durationLabel?: string;
  durationValue?: string;
  meetingPointLabel?: string;
  meetingPointValue?: string;
  safetyBufferLabel?: string;
  safetyBufferValue?: string;
  theme?: "light" | "dark";
  className?: string;
}

export default function GeoDirectAnswerCard({
  fact,
  customQuestion,
  customAnswer,
  pricingLabel,
  pricingValue,
  durationLabel,
  durationValue,
  meetingPointLabel,
  meetingPointValue,
  safetyBufferLabel,
  safetyBufferValue,
  theme = "light",
  className = "",
}: GeoDirectAnswerCardProps) {
  const isDark = theme === "dark";

  const question = customQuestion || fact?.directQuestion || "Alaska Cruise Shore Excursion Overview";
  const answer =
    customAnswer ||
    fact?.directAnswer ||
    "Local Alaskan operators provide independent shore excursions with direct cruise dock transfers, small group sizes, and guaranteed on-time return to your cruise ship.";

  const priceL = pricingLabel || fact?.pricingLabel || "Published Starting Rate";
  const priceV = pricingValue || fact?.pricingValue || "Independent pricing (No ship markup)";

  const durL = durationLabel || fact?.durationLabel || "Duration & Excursion Window";
  const durV = durationValue || fact?.durationValue || "Timed to your ship's port call";

  const meetL = meetingPointLabel || fact?.meetingPointLabel || "Cruise Pier Meeting Point";
  const meetV = meetingPointValue || fact?.meetingPointValue || "Direct pier pickup or short downtown walk";

  const buffL = safetyBufferLabel || fact?.safetyBufferLabel || "Back-to-Ship Protection";
  const buffV = safetyBufferValue || fact?.safetyBufferValue || "100% On-Time Ship Return Guarantee";

  return (
    <div
      data-geo-answer-card
      className={`my-8 rounded-[1.75rem] border p-6 sm:p-8 transition-all shadow-sm ${
        isDark
          ? "border-sky-800/60 bg-slate-900 text-white shadow-sky-950/40"
          : "border-sky-100 bg-white text-slate-950 shadow-slate-200/50"
      } ${className}`}
    >
      {/* DIRECT ANSWER HEADER (Google Snippet Target) */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 mb-2.5">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
          <span>⚡ Direct Cruise Answer &bull; Alaska Local Intel</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-3 text-slate-950 dark:text-white">
          {question}
        </h3>
        <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
          {answer}
        </p>
      </div>

      {/* 4-POINT FAST FACTS MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5 border-t border-slate-100 dark:border-slate-800">
        {/* Fact 1: Price */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {priceL}
          </span>
          <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-400 leading-snug">
            {priceV}
          </strong>
        </div>

        {/* Fact 2: Duration */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {durL}
          </span>
          <strong className="text-sm font-bold text-sky-800 dark:text-sky-300 leading-snug">
            {durV}
          </strong>
        </div>

        {/* Fact 3: Meeting Point */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {meetL}
          </span>
          <strong className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
            {meetV}
          </strong>
        </div>

        {/* Fact 4: Ship Guarantee Buffer */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {buffL}
          </span>
          <strong className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-400 leading-snug">
            {buffV}
          </strong>
        </div>
      </div>
    </div>
  );
}

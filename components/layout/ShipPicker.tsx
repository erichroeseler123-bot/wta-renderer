"use client";
import { useState } from "react";
import { useCruise } from "@/context/CruiseContext";
import {
  CRUISE_LINES,
  getCruiseLineForShip,
  getFirstSailingDateForShip,
  getShipsForCruiseLine,
} from "@/lib/cruiseShips";

export default function ShipPicker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { ship, date, setCruise, clearCruise } = useCruise();
  const [tempLine, setTempLine] = useState("");
  const [tempShip, setTempShip] = useState("");
  const selectedShip = tempShip || ship || "";
  const selectedLine = tempLine || (selectedShip ? getCruiseLineForShip(selectedShip) : "");
  const shipOptions = selectedLine ? getShipsForCruiseLine(selectedLine) : [];
  const selectedDate = selectedShip ? getFirstSailingDateForShip(selectedShip) : "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Plan Your Cruise Day</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">Cruise Line</label>
            <select
              value={selectedLine}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500"
              onChange={(e) => {
                setTempLine(e.target.value);
                setTempShip("");
              }}
            >
              <option value="">Select your cruise line...</option>
              {CRUISE_LINES.map((line) => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">Ship</label>
          <select
            value={selectedShip}
            disabled={!selectedLine}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            onChange={(e) => setTempShip(e.target.value)}
          >
            <option value="">{selectedLine ? "Choose your ship..." : "Select cruise line first"}</option>
            {shipOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">Sail Date</label>
            <div className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
              {selectedDate || "Select ship to load first sailing date"}
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <button
            onClick={() => { if (selectedShip && selectedDate) { setCruise(selectedShip, selectedDate); onClose(); } }}
            disabled={!(selectedShip && selectedDate)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            See Matching Tours
          </button>
          {(ship || date) ? (
            <button
              onClick={() => { clearCruise(); setTempLine(""); setTempShip(""); onClose(); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Clear Cruise Plan
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

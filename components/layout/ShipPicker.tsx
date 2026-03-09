"use client";
import { useState } from "react";
import { useCruise } from "@/context/CruiseContext";

const SHIPS = [
  "Norwegian Encore",
  "Discovery Princess",
  "Ovation of the Seas",
];

export default function ShipPicker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { ship, date, setCruise, clearCruise } = useCruise();
  const [tempShip, setTempShip] = useState("");
  const [tempDate, setTempDate] = useState("");
  const selectedShip = tempShip || ship || "";
  const selectedDate = tempDate || date || "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Find Your Ship</h2>
        <div className="space-y-4">
          <select
            value={selectedShip}
            className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-indigo-700 transition-colors"
            onChange={(e) => setTempShip(e.target.value)}
          >
            <option value="">Choose a ship...</option>
            {SHIPS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-indigo-700 transition-colors"
            onChange={(e) => setTempDate(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <button
            onClick={() => { if (selectedShip && selectedDate) { setCruise(selectedShip, selectedDate); onClose(); } }}
            className="w-full bg-indigo-700 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-indigo-700/20"
          >
            See My Schedule
          </button>
          {(ship || date) ? (
            <button
              onClick={() => { clearCruise(); setTempShip(""); setTempDate(""); onClose(); }}
              className="w-full border border-slate-200 text-slate-700 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition"
            >
              Clear Saved Cruise
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

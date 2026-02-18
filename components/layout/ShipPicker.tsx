"use client";
import { useState } from 'react';
import { useCruise } from '@/context/CruiseContext';

export default function ShipPicker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setCruise } = useCruise();
  const [tempShip, setTempShip] = useState('');
  const [tempDate, setTempDate] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Find Your Ship</h2>
        <div className="space-y-4">
          <select 
            className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-indigo-700 transition-colors"
            onChange={(e) => setTempShip(e.target.value)}
          >
            <option value="">Choose a ship...</option>
            <option value="Norwegian Encore">Norwegian Encore</option>
            <option value="Discovery Princess">Discovery Princess</option>
            <option value="Ovation of the Seas">Ovation of the Seas</option>
          </select>
          <input 
            type="date" 
            className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-indigo-700 transition-colors"
            onChange={(e) => setTempDate(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { if(tempShip && tempDate) { setCruise(tempShip, tempDate); onClose(); } }}
          className="w-full bg-indigo-700 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-indigo-700/20"
        >
          See My Schedule
        </button>
      </div>
    </div>
  );
}

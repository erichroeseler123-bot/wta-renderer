"use client";
import Link from 'next/link';
import { useCruise } from '@/context/CruiseContext';

export default function SuccessPage() {
  const { ship, date } = useCruise();
  const voucherNum = `WTA-${Date.now().toString().slice(-6)}`;

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full text-green-600 text-5xl mb-4">
          ✓
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Booking Confirmed!</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Pack your bags, you're going to Alaska.</p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4">
          <div className="flex justify-between border-b border-slate-200 pb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Voucher ID</span>
            <span className="font-mono font-bold text-indigo-700">{voucherNum}</span>
          </div>
          {ship && (
            <div className="flex justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Verified Ship</span>
              <span className="font-bold">{ship}</span>
            </div>
          )}
        </div>

        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-left">
          <p className="text-blue-800 font-black uppercase text-[10px] mb-2 tracking-widest">Next Steps</p>
          <ul className="text-sm text-blue-900 space-y-2 font-medium">
            <li>• Check your email for detailed meeting instructions.</li>
            <li>• Your 100% Back-to-Ship Guarantee is now active.</li>
            <li>• We have notified the local operators of your arrival.</li>
          </ul>
        </div>

        <Link href="/" className="block w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
          Back to Home
        </Link>
      </div>
    </main>
  );
}

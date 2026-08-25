"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function ChequeProcessingPage() {
  const [chequeNo, setChequeNo] = useState("CHQ-901842");
  const [amount, setAmount] = useState("120000");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Cheque Registration & Processing</h1>
          <p className="text-sm text-white/50 mt-1">Register MICR cheque details and authorize payment against biometric identity.</p>
        </div>
        <Link href="/transactions" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all border border-white/10 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="bg-[rgba(15,23,40,0.82)] backdrop-blur-xl p-8 rounded-[28px] border border-white/10 shadow-xl space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cheque MICR Serial #</label>
            <input 
              type="text" 
              value={chequeNo} 
              onChange={(e) => setChequeNo(e.target.value)} 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-[color:var(--brass)] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[color:var(--brass)] focus:border-[color:var(--brass)] transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cheque Face Value ($)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[color:var(--brass)] focus:border-[color:var(--brass)] transition-all" 
            />
          </div>
        </div>

        <Link
          href="/biometrics/scan"
          className="flex items-center justify-center gap-2 w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-[color:var(--brass)] to-[#d7ab5c] hover:from-[#d7ab5c] hover:to-[color:var(--brass)] text-[#0F1B2B] font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Verify Drawer Biometrics</span>
        </Link>
      </div>
    </div>
  );
}
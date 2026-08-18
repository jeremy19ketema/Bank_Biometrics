"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function ChequeProcessingPage() {
  const [chequeNo, setChequeNo] = useState("CHQ-901842");
  const [amount, setAmount] = useState("120000");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Cheque Registration & Processing</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Register MICR cheque details and authorize payment against biometric identity.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cheque MICR Serial #</label>
            <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className="input-field font-mono text-[color:var(--brass)] font-bold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cheque Face Value ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field font-mono text-amber-400 font-bold" />
          </div>
        </div>

        <Link
          href="/biometrics/scan"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-bold text-sm shadow-lg shadow-[color:var(--brass)]/20"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Verify Drawer Biometrics</span>
        </Link>
      </div>
    </div>
  );
}
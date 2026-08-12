"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, ArrowRight } from "lucide-react";

export default function CashWithdrawalPage() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("ACC-100842");
  const [amount, setAmount] = useState("5000");

  const handleVerifyAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/biometrics/scan");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Cash Withdrawal Terminal</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Initiate cashier withdrawal clearance with mandatory optical biometric verification.</p>
      </div>

      <form onSubmit={handleVerifyAndProceed} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer Account Number</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="input-field font-mono text-[color:var(--brass)] font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Withdrawal Amount ($)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field font-mono text-emerald-400 font-bold"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B192C] border border-cyan-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-5 h-5 text-[color:var(--brass)] animate-pulse" />
            <div>
              <p className="text-slate-200 font-bold">Biometric Key Verification Required</p>
              <p className="text-slate-400 text-[11px]">Hardware sensor will scan customer index finger upon submission.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-5 h-5" />
          <span>Initiate Verification Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
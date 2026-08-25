"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CashWithdrawalPage() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("ACC-100842");
  const [amount, setAmount] = useState("5000");

  const handleVerifyAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/biometrics/scan");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Cash Withdrawal</h1>
          <p className="text-sm text-white/50 mt-1">Initiate cashier withdrawal clearance with mandatory optical biometric verification.</p>
        </div>
        <Link href="/transactions" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all border border-white/10 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleVerifyAndProceed} className="bg-[rgba(15,23,40,0.82)] backdrop-blur-xl p-8 rounded-[28px] border border-white/10 shadow-xl space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer Account Number</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-[color:var(--brass)] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[color:var(--brass)] focus:border-[color:var(--brass)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Withdrawal Amount ($)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[color:var(--brass)] focus:border-[color:var(--brass)] transition-all"
            />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[color:var(--brass)]/5 border border-[color:var(--brass)]/20 flex items-center justify-between text-xs mt-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[color:var(--brass)]/10 flex items-center justify-center text-[color:var(--brass)] animate-pulse">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Biometric Key Verification Required</p>
              <p className="text-white/50 text-xs mt-0.5">Hardware sensor will scan customer index finger upon submission.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[color:var(--brass)] to-[#d7ab5c] hover:from-[#d7ab5c] hover:to-[color:var(--brass)] text-[#0F1B2B] font-bold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 mt-4"
        >
          <Fingerprint className="w-5 h-5" />
          <span>Initiate Verification Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
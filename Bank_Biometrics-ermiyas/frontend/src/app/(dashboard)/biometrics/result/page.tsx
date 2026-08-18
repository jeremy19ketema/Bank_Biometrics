"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function VerificationResultPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            VERIFICATION MATCH POSITIVE (99.98%)
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-3">Identity Authorization Confirmed</h1>
          <p className="text-xs text-slate-400 mt-1">Customer biometric fingerprint template matches institutional ledger database.</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 text-left text-xs space-y-3 font-mono">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Customer Name:</span>
            <span className="text-white font-bold">Abebe Bikila</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Account Number:</span>
            <span className="text-[color:var(--brass)] font-bold">ACC-100842</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Match Score:</span>
            <span className="text-emerald-400 font-bold">998 / 1000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Audit Reference:</span>
            <span className="text-slate-300">BIO-REF-9024182</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/transactions/history"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Complete Withdrawal Payout
          </Link>
        </div>
      </div>
    </div>
  );
}
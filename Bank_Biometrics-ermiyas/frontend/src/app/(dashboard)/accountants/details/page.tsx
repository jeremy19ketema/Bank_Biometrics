import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountantDetailsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Teller Operator Inspection</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Detailed account profile for Bethlehem Haile (ACT-401).</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xl">
            BH
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bethlehem Haile</h2>
            <p className="text-xs text-slate-400 font-mono">ID: ACT-401 | Till: Till #01 | Branch: Main HQ Branch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Today's Processed Volume</span>
            <p className="text-[color:var(--moss)] font-bold font-mono text-base">$420,000.00</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Biometric Match Accuracy</span>
            <p className="text-[color:var(--brass)] font-bold font-mono text-base">99.9%</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Active Hardware Terminal</span>
            <p className="text-purple-400 font-bold font-mono text-base">Terminal #4-B</p>
          </div>
        </div>
      </div>
    </div>
  );
}
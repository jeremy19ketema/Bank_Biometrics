import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountantPerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Teller Performance & Scan Efficiency</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Statistical metrics on cashier verification speed and transaction throughput.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Verification Speed</span>
          <div className="text-2xl font-extrabold text-white">1.8 Seconds</div>
          <span className="text-[11px] text-[color:var(--moss)] font-medium">Fastest Operator Cohort</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">False Rejection Rate (FRR)</span>
          <div className="text-2xl font-extrabold text-[color:var(--brass)]">0.002%</div>
          <span className="text-[11px] text-[color:var(--brass)] font-medium">Optimal Sensor Cleanliness</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Transactions Handled Today</span>
          <div className="text-2xl font-extrabold text-purple-400">184 Transactions</div>
          <span className="text-[11px] text-slate-400 font-medium">Zero Discrepancy</span>
        </div>
      </div>
    </div>
  );
}
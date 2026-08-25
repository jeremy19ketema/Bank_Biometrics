"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
} from "lucide-react";

export default function TransactionsPage() {
  const recentTransactions = [
    { ref: "TX-9038", customer: "Abebe Bikila", type: "Cash Withdrawal", amount: "$5,000.00", status: "Completed", time: "10 mins ago" },
    { ref: "TX-9037", customer: "Tigist Assefa", type: "Cheque Clearance", amount: "$45,000.00", status: "Completed", time: "35 mins ago" },
    { ref: "TX-9036", customer: "Haile Gebrselassie", type: "Account Clearance", amount: "$150,000.00", status: "Pending", time: "1 hour ago" },
    { ref: "TX-9035", customer: "Bethelhem Haile", type: "Cash Withdrawal", amount: "$12,500.00", status: "Flagged", time: "2 hours ago" },
    { ref: "TX-9034", customer: "Solomon Tesfaye", type: "Transfer", amount: "$8,200.00", status: "Completed", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Transaction Overview</h1>
          <p className="text-sm text-white/50 mt-1">
            Monitor all financial transactions, approvals, and settlement status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/transactions/analytics"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all border border-white/10"
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </Link>
          <Link
            href="/transactions/history"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] text-sm font-bold transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Receipt className="w-4 h-4" />
            Full History
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--brass)]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--brass)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Total Volume Today</p>
              <p className="text-2xl font-bold text-white mt-0.5">$2.4M</p>
              <p className="text-[11px] text-[color:var(--moss)] font-medium mt-1">↑ 12% vs yesterday</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-white/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/70 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Avg Processing Time</p>
              <p className="text-2xl font-bold text-white mt-0.5">42s</p>
              <p className="text-[11px] text-white/50 font-medium mt-1">Including biometric</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--clay)]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--clay)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,119,108,0.1)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Flagged Transactions</p>
              <p className="text-2xl font-bold text-[color:var(--clay)] mt-0.5">2</p>
              <p className="text-[11px] text-[color:var(--clay)] font-medium mt-1">Requires review</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--moss)]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--moss)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(76,122,94,0.1)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Success Rate</p>
              <p className="text-2xl font-bold text-[color:var(--moss)] mt-0.5">99.4%</p>
              <p className="text-[11px] text-[color:var(--moss)] font-medium mt-1">↑ 0.2% vs last week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] shadow-xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-white/50 mt-1">Latest system transactions</p>
          </div>
          <Link href="/transactions/history" className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all border border-white/10">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B192C]/50">
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Reference</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Customer</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Type</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Time</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {recentTransactions.map((tx) => (
                <tr key={tx.ref} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-5 px-8 font-mono text-xs font-semibold text-[color:var(--brass)]">{tx.ref}</td>
                  <td className="py-5 px-8 text-sm text-white font-medium">{tx.customer}</td>
                  <td className="py-5 px-8 text-sm text-white/80">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">{tx.type}</span>
                  </td>
                  <td className="py-5 px-8 text-right font-mono text-sm text-white font-bold">{tx.amount}</td>
                  <td className="py-5 px-8 text-xs text-white/50">{tx.time}</td>
                  <td className="py-5 px-8 text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === "Completed" ? "bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20" :
                      tx.status === "Pending" ? "bg-white/5 text-white/60 border border-white/10" :
                      "bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/transactions/withdrawal"
          className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--brass)]/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--brass)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/20 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white group-hover:text-[color:var(--brass)] transition-colors">
                Cash Withdrawal
              </h3>
              <p className="text-xs text-white/50 mt-1">Process cash payout</p>
            </div>
          </div>
        </Link>

        <Link
          href="/transactions/cheque"
          className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--moss)]/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--moss)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 flex items-center justify-center group-hover:bg-[color:var(--moss)] group-hover:text-[#0F1B2B] transition-colors shadow-[0_0_15px_rgba(76,122,94,0.1)] group-hover:shadow-[0_0_20px_rgba(76,122,94,0.3)]">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white group-hover:text-[color:var(--moss)] transition-colors">
                Cheque Processing
              </h3>
              <p className="text-xs text-white/50 mt-1">Clear MICR cheques</p>
            </div>
          </div>
        </Link>

        <Link
          href="/transactions/approval"
          className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--clay)]/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--clay)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 flex items-center justify-center group-hover:bg-[color:var(--clay)] group-hover:text-[#0F1B2B] transition-colors shadow-[0_0_15px_rgba(217,119,108,0.1)] group-hover:shadow-[0_0_20px_rgba(217,119,108,0.3)]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white group-hover:text-[color:var(--clay)] transition-colors">
                Approvals
              </h3>
              <p className="text-xs text-white/50 mt-1">Review pending requests</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
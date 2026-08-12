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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Transaction Overview</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Monitor all financial transactions, approvals, and settlement status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/transactions/analytics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Analytics
          </Link>
          <Link
            href="/transactions/history"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            <Receipt className="w-3.5 h-3.5" />
            Full History
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Volume Today
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">$2.4M</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">↑ 12% vs yesterday</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Avg Processing Time
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">42s</p>
            <p className="text-[10px] text-[color:var(--ledger-paper-dim)]">Including biometric</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Flagged Transactions
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">2</p>
            <p className="text-[10px] text-[color:var(--clay)] font-medium">Requires review</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Success Rate
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">99.4%</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">↑ 0.2% vs last week</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Recent Transactions</h3>
          <Link href="/transactions/history" className="font-mono text-xs text-[color:var(--brass)] hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Time</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.ref}>
                  <td className="mono-cell font-semibold text-[color:var(--brass)]">{tx.ref}</td>
                  <td>{tx.customer}</td>
                  <td>{tx.type}</td>
                  <td style={{ textAlign: "right" }} className="mono-cell font-semibold">
                    {tx.amount}
                  </td>
                  <td className="text-[color:var(--ledger-paper-dim)] text-xs">{tx.time}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className={`status-chip ${
                      tx.status === "Completed" ? "pass" :
                      tx.status === "Pending" ? "info" :
                      "fail"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/transactions/withdrawal"
          className="panel hover:border-[color:var(--brass)] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass)] transition-colors">
                Cash Withdrawal
              </h3>
              <p className="text-xs text-[color:var(--ledger-paper-dim)]">Process cash payout</p>
            </div>
          </div>
        </Link>

        <Link
          href="/transactions/cheque"
          className="panel hover:border-[color:var(--moss)] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center group-hover:bg-[color:var(--moss)] group-hover:text-[#0F1B2B] transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[color:var(--ledger-paper)] group-hover:text-[color:var(--moss)] transition-colors">
                Cheque Processing
              </h3>
              <p className="text-xs text-[color:var(--ledger-paper-dim)]">Clear MICR cheques</p>
            </div>
          </div>
        </Link>

        <Link
          href="/transactions/approval"
          className="panel hover:border-[color:var(--clay)] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center group-hover:bg-[color:var(--clay)] group-hover:text-[#0F1B2B] transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[color:var(--ledger-paper)] group-hover:text-[color:var(--clay)] transition-colors">
                Approvals
              </h3>
              <p className="text-xs text-[color:var(--ledger-paper-dim)]">Review pending requests</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Receipt,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { bankApi } from "@/services/bankApi";

type TxRow = {
  id: string;
  referenceNumber: string;
  customerName: string;
  type: string;
  amount: number;
  status: string;
  timestamp: string;
};

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}

function statusChipClass(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "status-chip pass";
    case "PENDING_APPROVAL":
      return "status-chip info";
    default:
      return "status-chip fail";
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await bankApi.transactions();
    if (result.success && Array.isArray(result.data)) {
      setTransactions(result.data as TxRow[]);
    } else {
      setError(result.message || "Failed to load transactions.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const kpis = useMemo(() => {
    const today = new Date().toDateString();
    const todays = transactions.filter((t) => new Date(t.timestamp).toDateString() === today);
    const completed = transactions.filter((t) => t.status === "COMPLETED").length;
    const successRate = transactions.length ? (completed / transactions.length) * 100 : 0;

    return {
      volumeToday: todays.filter((t) => t.status !== "REJECTED").reduce((s, t) => s + t.amount, 0),
      txToday: todays.length,
      pending: transactions.filter((t) => t.status === "PENDING_APPROVAL").length,
      rejected: transactions.filter((t) => t.status === "REJECTED").length,
      successRate
    };
  }, [transactions]);

  const recent = useMemo(() => transactions.slice(0, 6), [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Transaction Overview</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Live branch ledger — volumes, approvals, and settlement status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
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

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Volume Today</p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">{formatMoney(kpis.volumeToday)}</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">{kpis.txToday} transactions</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Awaiting Approval</p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">{kpis.pending}</p>
            <Link href="/transactions/approval" className="text-[10px] text-[color:var(--brass)] font-medium hover:underline">
              Review queue →
            </Link>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Rejected</p>
            <p className="text-xl font-bold text-[color:var(--clay)]">{kpis.rejected}</p>
            <p className="text-[10px] text-[color:var(--clay)] font-medium">Finalized rejections</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Completion Rate</p>
            <p className="text-xl font-bold text-[color:var(--moss)]">{kpis.successRate.toFixed(1)}%</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">{transactions.length} total entries</p>
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
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading ledger…
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No transactions recorded for your branch yet.</div>
        ) : (
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
                {recent.map((tx) => (
                  <tr key={tx.id}>
                    <td className="mono-cell font-semibold text-[color:var(--brass)]">{tx.referenceNumber}</td>
                    <td>{tx.customerName}</td>
                    <td className="text-ledger-paper-dim">{tx.type.replace(/_/g, " ")}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell font-semibold">{formatMoney(tx.amount)}</td>
                    <td className="text-[color:var(--ledger-paper-dim)] text-xs">{timeAgo(tx.timestamp)}</td>
                    <td style={{ textAlign: "right" }}>
                      <span className={statusChipClass(tx.status)}>{tx.status.replace(/_/g, " ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/transactions/withdrawal" className="panel hover:border-[color:var(--brass)] transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
              <TrendingUp className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass)] transition-colors">
                Cash Withdrawal
              </h3>
              <p className="text-xs text-[color:var(--ledger-paper-dim)]">Process cash payout</p>
            </div>
          </div>
        </Link>

        <Link href="/transactions/cheque" className="panel hover:border-[color:var(--moss)] transition-all group">
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

        <Link href="/transactions/approval" className="panel hover:border-[color:var(--clay)] transition-all group">
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

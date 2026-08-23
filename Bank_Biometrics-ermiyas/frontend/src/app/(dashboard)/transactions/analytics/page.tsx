"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { bankApi } from "@/services/bankApi";

type TxRow = {
  id: string;
  type: string;
  amount: number;
  status: string;
  accountantName: string;
  timestamp: string;
};

export default function TransactionAnalyticsPage() {
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await bankApi.transactions();
    if (result.success && Array.isArray(result.data)) {
      setTransactions(result.data as TxRow[]);
    } else {
      setError(result.message || "Failed to load analytics.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const yesterdayDate = new Date(Date.now() - 86400000).toDateString();

    const todays = transactions.filter((t) => new Date(t.timestamp).toDateString() === today && t.status !== "REJECTED");
    const yesterdays = transactions.filter((t) => new Date(t.timestamp).toDateString() === yesterdayDate && t.status !== "REJECTED");

    const volumeToday = todays.reduce((s, t) => s + t.amount, 0);
    const volumeYesterday = yesterdays.reduce((s, t) => s + t.amount, 0);
    const deltaPct = volumeYesterday > 0 ? ((volumeToday - volumeYesterday) / volumeYesterday) * 100 : null;

    const byType: Record<string, { count: number; volume: number }> = {};
    for (const t of transactions) {
      if (!byType[t.type]) byType[t.type] = { count: 0, volume: 0 };
      byType[t.type].count += 1;
      byType[t.type].volume += t.amount;
    }

    // Top tellers by settled volume
    const byTeller: Record<string, number> = {};
    for (const t of transactions) {
      if (t.status !== "COMPLETED") continue;
      byTeller[t.accountantName] = (byTeller[t.accountantName] || 0) + t.amount;
    }
    const topTellers = Object.entries(byTeller)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const flaggedRatio = transactions.length
      ? (transactions.filter((t) => t.status === "REJECTED").length / transactions.length) * 100
      : 0;

    return { volumeToday, deltaPct, txToday: todays.length, byType, topTellers, flaggedRatio };
  }, [transactions]);

  function formatMoney(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Financial Transaction Analytics</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Ledger-derived trends on deposits, withdrawals and clearance.</p>
        </div>
        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 self-start sm:self-auto rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 flex items-center justify-center gap-3 text-sm text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-[color:var(--brass)]" /> Computing analytics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Volume Today</span>
              <div className="text-2xl font-extrabold text-white">{formatMoney(stats.volumeToday)}</div>
              <span className={`text-[11px] font-medium ${stats.deltaPct !== null && stats.deltaPct >= 0 ? "text-[color:var(--moss)]" : "text-[color:var(--clay)]"}`}>
                {stats.deltaPct !== null
                  ? `${stats.deltaPct >= 0 ? "+" : ""}${stats.deltaPct.toFixed(1)}% vs yesterday`
                  : `${stats.txToday} transactions today`}
              </span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Transactions Today</span>
              <div className="text-2xl font-extrabold text-[color:var(--brass)]">{stats.txToday}</div>
              <span className="text-[11px] text-slate-400 font-medium">{transactions.length} total ledger entries</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Rejection Ratio</span>
              <div className="text-2xl font-extrabold text-purple-400">{stats.flaggedRatio.toFixed(2)}%</div>
              <span className="text-[11px] text-slate-400 font-medium">Of all recorded operations</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Volume by operation type */}
            <div className="ledger-panel">
              <div className="ledger-head">
                <h3 className="display">Volume by Operation</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th style={{ textAlign: "right" }}>Count</th>
                    <th style={{ textAlign: "right" }}>Total Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.byType).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-6 text-sm text-slate-400">No data yet.</td>
                    </tr>
                  ) : (
                    Object.entries(stats.byType).map(([type, agg]) => (
                      <tr key={type}>
                        <td className="font-semibold">{type.replace(/_/g, " ")}</td>
                        <td style={{ textAlign: "right" }} className="mono-cell">{agg.count}</td>
                        <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--moss)] font-bold">{formatMoney(agg.volume)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Top tellers */}
            <div className="ledger-panel">
              <div className="ledger-head">
                <h3 className="display">Top Tellers by Settled Volume</h3>
                <Link href="/accountants" className="mono text-xs text-[color:var(--brass)] hover:underline">View roster →</Link>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Teller</th>
                    <th style={{ textAlign: "right" }}>Settled Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topTellers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center p-6 text-sm text-slate-400">No completed transactions yet.</td>
                    </tr>
                  ) : (
                    stats.topTellers.map(([name, volume]) => (
                      <tr key={name}>
                        <td className="font-semibold">{name}</td>
                        <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--brass)] font-bold">{formatMoney(volume)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

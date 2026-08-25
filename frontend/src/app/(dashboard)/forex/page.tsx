"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Edit,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

// Mock exchange rates with editable flag
const initialRates = [
  { pair: "USD/ETB", bid: 57.42, ask: 57.48, change: "+0.15%" },
  { pair: "EUR/ETB", bid: 62.18, ask: 62.25, change: "-0.08%" },
  { pair: "GBP/ETB", bid: 72.15, ask: 72.22, change: "+0.22%" },
  { pair: "JPY/ETB", bid: 0.38, ask: 0.39, change: "+0.01%" },
  { pair: "CAD/ETB", bid: 41.85, ask: 41.92, change: "+0.05%" },
  { pair: "AUD/ETB", bid: 37.20, ask: 37.28, change: "-0.03%" },
];

export default function FOREXDashboard() {
  const { toast, toasts, dismissToast } = useToast();
  const [rates, setRates] = useState(initialRates);
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ bid: number; ask: number }>({ bid: 0, ask: 0 });

  const recentTrades = [
    { ref: "FX-2024-001", pair: "USD/ETB", type: "Buy", amount: 250000, rate: 57.42, status: "Completed", time: "10:42 UTC" },
    { ref: "FX-2024-002", pair: "EUR/USD", type: "Sell", amount: 150000, rate: 1.0825, status: "Pending Approval", time: "10:38 UTC" },
    { ref: "FX-2024-003", pair: "GBP/ETB", type: "Buy", amount: 85000, rate: 72.15, status: "Completed", time: "10:15 UTC" },
    { ref: "FX-2024-004", pair: "USD/JPY", type: "Sell", amount: 500000, rate: 149.80, status: "Flagged", time: "09:55 UTC" },
  ];

  const handleEditRate = (pair: string) => {
    const rate = rates.find((r) => r.pair === pair);
    if (rate) {
      setEditingPair(pair);
      setEditValues({ bid: rate.bid, ask: rate.ask });
    }
  };

  const handleSaveRate = () => {
    if (!editingPair) return;
    setRates((prev) =>
      prev.map((r) =>
        r.pair === editingPair
          ? { ...r, bid: editValues.bid, ask: editValues.ask, change: (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 0.5).toFixed(2) + "%" }
          : r
      )
    );
    toast.success("Rate Updated", `${editingPair} exchange rate updated successfully.`);
    setEditingPair(null);
  };

  const handleRefresh = () => {
    setRates((prev) =>
      prev.map((r) => ({
        ...r,
        change: (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 0.5).toFixed(2) + "%",
        bid: Number((r.bid + (Math.random() - 0.5) * 0.5).toFixed(2)),
        ask: Number((r.ask + (Math.random() - 0.5) * 0.5).toFixed(2)),
      }))
    );
    toast.info("Refreshed", "Exchange rates updated.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">FOREX Trading Dashboard</h1>
          <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">
            Real-time currency rates, trade execution, and dealer management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Rates
          </button>
          <Link
            href="/forex/users"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] text-sm font-bold transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Users className="w-4 h-4" />
            Manage Users
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
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Today's Volume</p>
              <p className="text-2xl font-bold text-white mt-0.5">$2.4M</p>
              <p className="text-[11px] text-[color:var(--moss)] font-medium mt-1 flex items-center gap-1">↑ 12% vs yesterday</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--brass)]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/70 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Open Positions</p>
              <p className="text-2xl font-bold text-white mt-0.5">14</p>
              <p className="text-[11px] text-white/50 font-medium mt-1">Across 6 pairs</p>
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
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Pending Settlement</p>
              <p className="text-2xl font-bold text-[color:var(--clay)] mt-0.5">3</p>
              <p className="text-[11px] text-[color:var(--clay)] font-medium mt-1">Requires approval</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--moss)]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--moss)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(76,122,94,0.1)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">P&L Today</p>
              <p className="text-2xl font-bold text-[color:var(--moss)] mt-0.5">+$24,500</p>
              <p className="text-[11px] text-[color:var(--moss)] font-medium mt-1">Profitable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Exchange Rates */}
      <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Live Exchange Rates</h3>
            <p className="text-sm text-white/50 mt-1">Auto-refresh 30s · Click edit to update</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--moss)] animate-pulse" />
            Live
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rates.map((rate) => (
            <div
              key={rate.pair}
              className="border border-white/10 rounded-2xl p-5 bg-white/5 hover:bg-white/10 hover:border-[color:var(--brass)]/40 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-white tracking-tight">{rate.pair}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${rate.change.startsWith("+") ? "bg-[color:var(--moss)]/10 text-[color:var(--moss)]" : "bg-[color:var(--clay)]/10 text-[color:var(--clay)]"}`}>
                    {rate.change}
                  </span>
                  {editingPair === rate.pair ? (
                    <button
                      onClick={handleSaveRate}
                      className="text-[color:var(--brass)] hover:text-white transition-colors"
                      title="Save"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditRate(rate.pair)}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-[color:var(--brass)] transition-all"
                      title="Edit Rate"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-white/40 font-semibold text-xs uppercase tracking-wider block mb-1">Bid</span>
                  {editingPair === rate.pair ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.bid}
                      onChange={(e) => setEditValues({ ...editValues, bid: parseFloat(e.target.value) || 0 })}
                      className="w-20 bg-black/40 border border-[color:var(--brass)] rounded-lg px-2 py-1 text-sm text-[color:var(--brass)] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[color:var(--brass)]"
                    />
                  ) : (
                    <span className="font-mono text-white text-lg">{rate.bid.toFixed(2)}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-white/40 font-semibold text-xs uppercase tracking-wider block mb-1">Ask</span>
                  {editingPair === rate.pair ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.ask}
                      onChange={(e) => setEditValues({ ...editValues, ask: parseFloat(e.target.value) || 0 })}
                      className="w-20 bg-black/40 border border-[color:var(--brass)] rounded-lg px-2 py-1 text-sm text-[color:var(--brass)] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[color:var(--brass)] text-right"
                    />
                  ) : (
                    <span className="font-mono text-white text-lg">{rate.ask.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] shadow-xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-semibold text-white">Recent Trades</h3>
            <p className="text-xs text-white/50 mt-1">Latest forex transaction records</p>
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
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Pair</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Type</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Rate</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {recentTrades.map((trade) => (
                <tr key={trade.ref} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-5 px-8 font-mono text-xs font-semibold text-[color:var(--brass)]">{trade.ref}</td>
                  <td className="py-5 px-8 text-sm text-white font-medium">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">{trade.pair}</span>
                  </td>
                  <td className={`py-5 px-8 text-sm font-bold ${trade.type === "Buy" ? "text-[color:var(--moss)]" : "text-[color:var(--clay)]"}`}>{trade.type}</td>
                  <td className="py-5 px-8 text-right font-mono text-sm text-white">${trade.amount.toLocaleString()}</td>
                  <td className="py-5 px-8 text-right font-mono text-sm text-white/70">{trade.rate}</td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                      trade.status === "Completed" ? "bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20" :
                      trade.status === "Pending Approval" ? "bg-white/5 text-white/60 border border-white/10" :
                      "bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20"
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-[color:var(--brass)]/10 text-white/50 hover:text-[color:var(--brass)] text-xs font-bold transition-all border border-white/10 hover:border-[color:var(--brass)]/30 opacity-0 group-hover:opacity-100 shadow-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
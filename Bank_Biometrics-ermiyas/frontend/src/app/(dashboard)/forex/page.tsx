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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">FOREX Trading Dashboard</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Real-time currency rates, trade execution, and dealer management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Rates
          </button>
          <Link
            href="/forex/users"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30"
          >
            <Users className="w-3.5 h-3.5" />
            Manage FOREX Users
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
              Today's Volume
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
              Open Positions
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">14</p>
            <p className="text-[10px] text-[color:var(--ledger-paper-dim)]">Across 6 pairs</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Pending Settlement
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">3</p>
            <p className="text-[10px] text-[color:var(--clay)] font-medium">Requires approval</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              P&L Today
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">+$24,500</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">Profitable</p>
          </div>
        </div>
      </div>

      {/* Live Exchange Rates */}
      <div className="panel">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="display">Live Exchange Rates</h3>
            <div className="panel-sub">Auto-refresh 30s · Click edit to update</div>
          </div>
          <span className="status-pill bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]">Live</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {rates.map((rate) => (
            <div
              key={rate.pair}
              className="border border-[color:var(--line-strong)] rounded-lg p-4 bg-[rgba(15,23,40,0.6)] hover:border-[color:var(--brass)]/40 transition-colors group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[color:var(--ledger-paper)]">{rate.pair}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${rate.change.startsWith("+") ? "text-[color:var(--moss)]" : "text-[color:var(--clay)]"}`}>
                    {rate.change}
                  </span>
                  {editingPair === rate.pair ? (
                    <button
                      onClick={handleSaveRate}
                      className="text-[color:var(--brass)] hover:text-[color:var(--ledger-paper)] transition-colors"
                      title="Save"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditRate(rate.pair)}
                      className="opacity-0 group-hover:opacity-100 text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)] transition-all"
                      title="Edit Rate"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-[color:var(--ledger-paper-dim)]">Bid</span>
                  {editingPair === rate.pair ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.bid}
                      onChange={(e) => setEditValues({ ...editValues, bid: parseFloat(e.target.value) || 0 })}
                      className="ml-2 w-16 bg-[#0B192C] border border-[color:var(--brass)] rounded px-1 py-0.5 text-sm text-[color:var(--brass)] font-mono focus:outline-none"
                    />
                  ) : (
                    <span className="ml-2 font-mono text-[color:var(--ledger-paper)]">{rate.bid.toFixed(2)}</span>
                  )}
                </div>
                <div>
                  <span className="text-[color:var(--ledger-paper-dim)]">Ask</span>
                  {editingPair === rate.pair ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.ask}
                      onChange={(e) => setEditValues({ ...editValues, ask: parseFloat(e.target.value) || 0 })}
                      className="ml-2 w-16 bg-[#0B192C] border border-[color:var(--brass)] rounded px-1 py-0.5 text-sm text-[color:var(--brass)] font-mono focus:outline-none"
                    />
                  ) : (
                    <span className="ml-2 font-mono text-[color:var(--ledger-paper)]">{rate.ask.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Recent Trades</h3>
          <Link href="/transactions/history" className="font-mono text-xs text-[color:var(--brass)] hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Pair</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade) => (
                <tr key={trade.ref}>
                  <td className="mono-cell font-semibold text-[color:var(--brass)]">{trade.ref}</td>
                  <td>{trade.pair}</td>
                  <td className={trade.type === "Buy" ? "text-[color:var(--moss)]" : "text-[color:var(--clay)]"}>{trade.type}</td>
                  <td style={{ textAlign: "right" }} className="mono-cell">${trade.amount.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }} className="mono-cell">{trade.rate}</td>
                  <td>
                    <span className={`status-chip ${trade.status === "Completed" ? "pass" : trade.status === "Pending Approval" ? "info" : "fail"}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-mini hover:border-[color:var(--brass)] hover:text-[color:var(--brass)]">View</button>
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
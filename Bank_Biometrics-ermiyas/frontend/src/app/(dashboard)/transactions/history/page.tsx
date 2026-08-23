"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { bankApi } from "@/services/bankApi";

type TxRow = {
  id: string;
  referenceNumber: string;
  accountNumber: string;
  customerName: string;
  type: string;
  amount: number;
  status: string;
  biometricVerified: boolean;
  accountantName: string;
  approvedBy: string | null;
  timestamp: string;
};

const STATUS_FILTERS = ["", "COMPLETED", "PENDING_APPROVAL", "REJECTED"];
const TYPE_FILTERS = ["", "CASH_WITHDRAWAL", "CHEQUE_DEPOSIT", "CHEQUE_CLEARANCE", "TRANSFER"];

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

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await bankApi.transactions({
      status: statusFilter || undefined,
      type: typeFilter || undefined
    });
    if (result.success && Array.isArray(result.data)) {
      setTransactions(result.data as TxRow[]);
    } else {
      setError(result.message || "Failed to load transaction history.");
    }
    setLoading(false);
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.referenceNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.accountNumber.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const exportCsv = () => {
    const header = "Reference,Customer,Account,Type,Amount,Status,Biometric Verified,Teller,Approved By,Timestamp";
    const rows = filtered.map((t) =>
      [
        t.referenceNumber,
        t.customerName,
        t.accountNumber,
        t.type,
        t.amount.toFixed(2),
        t.status,
        t.biometricVerified ? "YES" : "NO",
        t.accountantName,
        t.approvedBy || "",
        new Date(t.timestamp).toISOString()
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Transaction Audit Trail</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Ledger history of financial operations and biometric validations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 glass-panel p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reference, customer, or account number…"
          className="flex-1 bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[color:var(--brass)]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[color:var(--brass)]"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? s.replace(/_/g, " ") : "All statuses"}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[color:var(--brass)]"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t ? t.replace(/_/g, " ") : "All types"}
            </option>
          ))}
        </select>
      </div>

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">History</h3>
          <span className="mono text-xs text-ledger-paper-dim">{filtered.length} entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading audit trail…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No transactions match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Tx Reference</th>
                  <th>Customer</th>
                  <th>Teller</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Biometric</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td className="mono-cell font-semibold text-[color:var(--brass)]">{tx.referenceNumber}</td>
                    <td className="font-semibold">
                      {tx.customerName}
                      <span className="block text-[10px] text-slate-500 mono-cell">{tx.accountNumber}</span>
                    </td>
                    <td className="text-ledger-paper-dim">{tx.accountantName}</td>
                    <td className="text-ledger-paper-dim">{tx.type.replace(/_/g, " ")}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--moss)] font-bold">
                      {tx.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </td>
                    <td className={`mono-cell font-bold ${tx.biometricVerified ? "text-[color:var(--brass)]" : "text-red-400"}`}>
                      {tx.biometricVerified ? "VERIFIED" : "NOT VERIFIED"}
                    </td>
                    <td className="text-[color:var(--ledger-paper-dim)] text-xs">
                      {new Date(tx.timestamp).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                    </td>
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
    </div>
  );
}

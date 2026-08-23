"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
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
  timestamp: string;
};

export default function TransactionApprovalPage() {
  const [queue, setQueue] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionMessage("");

    const result = await bankApi.transactions({ status: "PENDING_APPROVAL" });
    if (result.success && Array.isArray(result.data)) {
      setQueue(result.data as TxRow[]);
    } else {
      setError(result.message || "Failed to load the approval queue.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const decide = async (tx: TxRow, decision: "APPROVED" | "REJECTED") => {
    setBusyId(tx.id);
    setError("");
    setActionMessage("");

    const result = await bankApi.approveTransaction(tx.id, decision);
    setBusyId(null);

    if (result.success) {
      setActionMessage(
        decision === "APPROVED"
          ? `Transaction ${tx.referenceNumber} authorized — payout released.`
          : `Transaction ${tx.referenceNumber} rejected.`
      );
      await loadQueue();
    } else {
      setError(result.message || `Failed to ${decision === "APPROVED" ? "authorize" : "reject"} transaction.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Manager Override Approval Queue</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            High-value or unverified transactions awaiting branch manager passkey authorization.
          </p>
        </div>
        <button
          onClick={loadQueue}
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
      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-300">
          {actionMessage}
        </div>
      )}

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Pending Authorizations</h3>
          <span className="mono text-xs text-ledger-paper-dim">{queue.length} items</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading queue…
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm text-slate-400">No transactions awaiting authorization.</p>
            <Link href="/transactions/history" className="btn-mini inline-block">View full ledger</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Tx Reference</th>
                  <th>Customer</th>
                  <th>Operation</th>
                  <th>Teller</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Biometric</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((tx) => (
                  <tr key={tx.id}>
                    <td className="mono-cell font-semibold text-[color:var(--brass)]">{tx.referenceNumber}</td>
                    <td className="font-semibold">
                      {tx.customerName}
                      <span className="block text-[10px] text-slate-500 mono-cell">{tx.accountNumber}</span>
                    </td>
                    <td className="text-ledger-paper-dim">{tx.type.replace(/_/g, " ")}</td>
                    <td className="text-ledger-paper-dim">{tx.accountantName}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell text-amber-400 font-bold">
                      {tx.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </td>
                    <td>
                      <span className={`status-chip ${tx.biometricVerified ? "pass" : "fail"}`}>
                        {tx.biometricVerified ? "VERIFIED" : "NOT VERIFIED"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => decide(tx, "APPROVED")}
                          disabled={busyId === tx.id}
                          className="btn-mini approve flex items-center gap-1 disabled:opacity-50"
                        >
                          {busyId === tx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Authorize
                        </button>
                        <button
                          onClick={() => decide(tx, "REJECTED")}
                          disabled={busyId === tx.id}
                          className="btn-mini decline flex items-center gap-1 disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
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

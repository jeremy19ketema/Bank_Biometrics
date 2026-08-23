"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { bankApi, getSessionUser } from "@/services/bankApi";
import { Accountant } from "@/types";

function statusChipClass(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "status-chip pass";
    case "PENDING_FIRST_LOGIN":
      return "status-chip info";
    case "PENDING_APPROVAL":
      return "status-chip info";
    default:
      return "status-chip fail";
  }
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function AccountantListPage() {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [branchLabel, setBranchLabel] = useState("All Branches");

  const loadAccountants = useCallback(async () => {
    setLoading(true);
    setError("");

    const user = getSessionUser();
    if (user?.branchName) setBranchLabel(user.branchName);

    const result = await bankApi.accountants();
    if (result.success && Array.isArray(result.data)) {
      setAccountants(result.data as Accountant[]);
    } else {
      setError(result.message || "Failed to load accountants.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAccountants();
  }, [loadAccountants]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Accountant & Teller Roster</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Operational directory of cashiers and biometric verification operators — {branchLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAccountants}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link href="/accountants/create" className="btn-primary flex items-center gap-2">
            + Add Accountant / Teller
          </Link>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 font-medium">
          {error}
        </div>
      )}

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Active Tellers</h3>
          <span className="mono text-xs text-ledger-paper-dim">{accountants.length} entries</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading accountant roster…</div>
        ) : accountants.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-slate-400">No accountants registered{branchLabel !== "All Branches" ? ` for ${branchLabel}` : ""} yet.</p>
            <Link href="/accountants/create" className="btn-mini inline-block">Register your first teller</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Teller ID</th>
                  <th>Full Name</th>
                  <th>Branch</th>
                  <th style={{ textAlign: "right" }}>Transactions</th>
                  <th style={{ textAlign: "right" }}>Processed Volume</th>
                  <th style={{ textAlign: "right" }}>Match Accuracy</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accountants.map((a) => (
                  <tr key={a.id}>
                    <td className="mono-cell font-semibold text-[color:var(--brass)]">{a.employeeId}</td>
                    <td className="font-semibold">
                      {a.fullName}
                      <span className="block text-[10px] text-slate-500 mono-cell">@{a.username}</span>
                    </td>
                    <td className="text-ledger-paper-dim">{a.branchName}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell">{a.totalTransactions}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--moss)]">{formatMoney(a.totalProcessedVolume)}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--brass)]">
                      {a.verificationSuccessRate !== null ? `${a.verificationSuccessRate}%` : "—"}
                    </td>
                    <td>
                      <span className={statusChipClass(a.status)}>{a.status.replace(/_/g, " ")}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-2">
                        <Link href={`/accountants/details?id=${a.id}`} className="btn-mini">Inspect</Link>
                        <Link href={`/accountants/edit?id=${a.id}`} className="btn-mini">Edit</Link>
                        <Link href={`/accountants/performance?id=${a.id}`} className="btn-mini">Performance</Link>
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

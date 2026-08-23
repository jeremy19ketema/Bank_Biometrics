"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { bankApi } from "@/services/bankApi";
import { Accountant } from "@/types";

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function PerformanceContent() {
  const searchParams = useSearchParams();
  const staffId = searchParams.get("id");

  const [accountant, setAccountant] = useState<Accountant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    if (!staffId) {
      setError("No accountant selected. Open this page from the roster.");
      setLoading(false);
      return;
    }

    // Stats are aggregated per accountant by the staff endpoint
    const result = await bankApi.accountants();
    if (result.success && Array.isArray(result.data)) {
      const match = (result.data as Accountant[]).find((a) => a.id === staffId);
      if (match) {
        setAccountant(match);
      } else {
        setError("Accountant not found in your branch roster.");
      }
    } else {
      setError(result.message || "Failed to load performance data.");
    }
    setLoading(false);
  }, [staffId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Teller Performance & Scan Efficiency</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">
            Ledger-derived throughput and biometric verification quality.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading performance metrics…
        </div>
      ) : error || !accountant ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-400">{error || "No performance data available."}</p>
          <Link href="/accountants" className="btn-mini inline-block">← Return to roster</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[color:var(--ledger-paper)]">{accountant.fullName}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {accountant.employeeId} · {accountant.branchName} ·{" "}
                <span className={accountant.status === "ACTIVE" ? "text-emerald-400" : "text-amber-400"}>
                  {accountant.status.replace(/_/g, " ")}
                </span>
              </p>
            </div>
            <button onClick={loadStats} className="btn-mini self-start sm:self-auto">Refresh</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Transactions Handled</span>
              <div className="text-2xl font-extrabold text-purple-400">{accountant.totalTransactions}</div>
              <span className="text-[11px] text-slate-400 font-medium">All-time processed ledger entries</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Processed Volume</span>
              <div className="text-2xl font-extrabold text-white">{formatMoney(accountant.totalProcessedVolume)}</div>
              <span className="text-[11px] text-[color:var(--moss)] font-medium">Cumulative cashier throughput</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Biometric Match Accuracy</span>
              <div className="text-2xl font-extrabold text-[color:var(--brass)]">
                {accountant.verificationSuccessRate !== null ? `${accountant.verificationSuccessRate}%` : "—"}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Average operator scan score</span>
            </div>
          </div>

          {accountant.lastLoginAt && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-xs text-slate-300">
              Last login:{" "}
              {new Date(accountant.lastLoginAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AccountantPerformancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading…</div>}>
      <PerformanceContent />
    </Suspense>
  );
}

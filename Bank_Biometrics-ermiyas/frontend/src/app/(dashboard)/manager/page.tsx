"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { bankApi, getSessionUser, ApiResult } from "@/services/bankApi";
import { Accountant, ApprovalRequest } from "@/types";

type TxSummary = {
  total: number;
  volumeToday: number;
  pendingCount: number;
};

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export default function ManagerDashboardPage() {
  const [sessionUser, setSessionUser] = useState<ReturnType<typeof getSessionUser>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [txSummary, setTxSummary] = useState<TxSummary>({ total: 0, volumeToday: 0, pendingCount: 0 });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const user = getSessionUser();
    setSessionUser(user);

    const [approvalsResult, accountantsResult, txResult]: [
      ApiResult<ApprovalRequest[]>,
      ApiResult<Accountant[]>,
      ApiResult<any[]>
    ] = await Promise.all([
      bankApi.pendingApprovals(user?.branchId),
      bankApi.accountants(),
      bankApi.transactions()
    ]);

    const errors: string[] = [];
    if (approvalsResult.success && Array.isArray(approvalsResult.data)) {
      setPendingApprovals(approvalsResult.data);
    } else if (!approvalsResult.success) {
      errors.push("approval queue");
    }

    if (accountantsResult.success && Array.isArray(accountantsResult.data)) {
      setAccountants(accountantsResult.data);
    } else if (!accountantsResult.success) {
      errors.push("accountant roster");
    }

    if (txResult.success && Array.isArray(txResult.data)) {
      const transactions = txResult.data as any[];
      const today = new Date().toDateString();
      const todays = transactions.filter((t) => new Date(t.timestamp).toDateString() === today);
      setTxSummary({
        total: transactions.length,
        volumeToday: todays.filter((t) => t.status !== "REJECTED").reduce((sum: number, t) => sum + (t.amount || 0), 0),
        pendingCount: transactions.filter((t) => t.status === "PENDING_APPROVAL").length
      });
    } else if (!txResult.success) {
      errors.push("transaction ledger");
    }

    setError(errors.length ? `Failed to load ${errors.join(", ")}. Check that the backend is running.` : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeAccountants = accountants.filter((a) => a.status === "ACTIVE").length;
  const urgentCount = pendingApprovals.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="section-title mb-2">Operations overview</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Branch leadership control center
            </h1>
            <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
              Live branch readiness for{" "}
              <span className="font-semibold text-[color:var(--brass)]">
                {sessionUser?.branchName || "your branch"}
              </span>{" "}
              {sessionUser?.branchId ? (
                <span className="mono text-xs text-[color:var(--ledger-paper-dim)]/70">({sessionUser.branchId})</span>
              ) : null}
              .
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper-dim)] transition hover:text-[color:var(--ledger-paper)] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/approvals"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)]"
            >
              <BadgeCheck className="h-4 w-4" />
              Review queue{urgentCount > 0 ? ` (${urgentCount})` : ""}
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{error}</div>
      )}

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Pending approvals",
            value: loading ? "…" : String(pendingApprovals.length),
            delta: urgentCount > 0 ? "Action required" : "Queue clear",
            icon: FileCheck2,
            href: "/approvals"
          },
          {
            label: "Branch accountants",
            value: loading ? "…" : `${activeAccountants}/${accountants.length}`,
            delta: "Active / registered",
            icon: UserRound,
            href: "/accountants"
          },
          {
            label: "Volume today",
            value: loading ? "…" : formatMoney(txSummary.volumeToday),
            delta: `${txSummary.total} ledger entries`,
            icon: Users,
            href: "/transactions/history"
          },
          {
            label: "Tx awaiting authorization",
            value: loading ? "…" : String(txSummary.pendingCount),
            delta: txSummary.pendingCount > 0 ? "Manager sign-off" : "Nothing pending",
            icon: AlertTriangle,
            href: "/transactions/approval"
          }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-5 shadow-[0_16px_40px_rgba(2,8,23,0.28)] transition hover:border-[color:var(--brass)]/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ledger-paper-dim)]">{metric.label}</span>
                <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
                {metric.value}
              </div>
              <div className={`mt-2 text-sm ${metric.delta === "Action required" || metric.delta === "Manager sign-off" ? "text-[color:var(--clay)]" : "text-[color:var(--moss)]"}`}>
                {metric.delta}
              </div>
            </Link>
          );
        })}
      </section>

      {loading ? (
        <section className="flex items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-10 text-sm text-[color:var(--ledger-paper-dim)]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading branch intelligence…
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Approval queue */}
          <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">Approval queue</div>
                <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">Pending actions</h2>
              </div>
              <Link href="/approvals" className="text-sm font-semibold text-[color:var(--brass)] hover:underline">
                Open full list →
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {pendingApprovals.length === 0 ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 text-sm text-[color:var(--ledger-paper-dim)]">
                  <CheckCircle2 className="h-5 w-5 text-[color:var(--moss)]" />
                  No pending requests — your branch queue is clear.
                </div>
              ) : (
                pendingApprovals.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[color:var(--ledger-paper)]">
                        {item.requestType.replace(/_/g, " ")}
                      </div>
                      <div className="mt-1 truncate text-sm text-[color:var(--ledger-paper-dim)]">
                        {item.details} · by {item.requestedByName} ·{" "}
                        {new Date(item.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="status-pill bg-[rgba(198,154,76,0.16)] text-[color:var(--brass)]">Pending</span>
                      <Link
                        href="/approvals"
                        className="rounded-full border border-white/10 p-2 text-[color:var(--ledger-paper-dim)] transition hover:text-[color:var(--ledger-paper)]"
                        title="Review request"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Branch intelligence */}
          <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">Branch intelligence</div>
                <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">
                  {sessionUser?.branchName || "Your branch"}
                </h2>
              </div>
              <div className={`status-pill ${urgentCount > 0 ? "bg-[rgba(168,69,46,0.16)] text-[color:var(--clay)]" : "bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]"}`}>
                {urgentCount > 0 ? `${urgentCount} pending` : "Healthy"}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ledger-paper)]">Branch identifier</div>
                    <div className="mono text-xs text-[color:var(--ledger-paper-dim)] break-all">
                      {sessionUser?.branchId || "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ledger-paper)]">Staff security</div>
                    <div className="text-sm text-[color:var(--ledger-paper-dim)]">
                      {accountants.filter((a) => a.status === "ACTIVE").length} active ·{" "}
                      {accountants.filter((a) => a.status !== "ACTIVE").length} restricted accounts
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/accountants/create"
                className="block rounded-2xl border border-dashed border-[color:var(--brass)]/30 bg-transparent p-4 text-center text-sm font-semibold text-[color:var(--brass)] transition hover:bg-[rgba(198,154,76,0.08)]"
              >
                + Register a new teller
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

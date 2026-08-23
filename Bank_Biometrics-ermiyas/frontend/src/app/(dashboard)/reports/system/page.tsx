"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import Pagination from "@/components/ui/Pagination";
import { bankApi } from "@/services/bankApi";

export const dynamic = "force-dynamic";

type LogEntry = {
  id: string;
  event: string;
  actor: string;
  actorId?: string;
  ip: string;
  timestamp: Date;
  status: "SUCCESS" | "WARNING" | "FAILURE" | "INFO";
  category: "AUTH" | "TRANSACTION" | "BIOMETRIC" | "SYSTEM" | "USER";
};

const PAGE_SIZE = 5;

// Status config for badges
const statusConfig = {
  SUCCESS: { label: "Success", bg: "bg-[color:var(--moss)]/15", text: "text-[color:var(--moss)]", border: "border-[color:var(--moss)]/30", icon: CheckCircle2 },
  WARNING: { label: "Warning", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", icon: AlertTriangle },
  FAILURE: { label: "Failure", bg: "bg-[color:var(--clay)]/15", text: "text-[color:var(--clay)]", border: "border-[color:var(--clay)]/30", icon: ShieldAlert },
  INFO: { label: "Info", bg: "bg-slate-600/20", text: "text-slate-300", border: "border-slate-600/30", icon: ShieldQuestion },
};

const categoryOptions = ["ALL", "AUTH", "TRANSACTION", "BIOMETRIC", "SYSTEM", "USER"];
const statusOptions = ["ALL", "SUCCESS", "WARNING", "FAILURE", "INFO"];

function relativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) !== 1 ? "s" : ""} ago`;
}

export default function SystemSecurityReportsPage() {
  const { toast, toasts, dismissToast } = useToast();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState({ totalSecurityEvents: 0, criticalThreatAlerts: 0, systemWarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLogs = useCallback(
    async (showToast = false) => {
      setIsRefreshing(true);
      setError("");

      const [logsResult, metricsResult] = await Promise.all([
        bankApi.auditLogs({
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined
        }),
        bankApi.auditMetrics()
      ]);

      if (logsResult.success && Array.isArray(logsResult.data)) {
        setLogs(
          (logsResult.data as Record<string, unknown>[]).map((l) => ({
            id: String(l.id ?? ""),
            event: String(l.action ?? l.event ?? ""),
            actor: String(l.actorName ?? l.actor ?? ""),
            actorId: l.actorId ? String(l.actorId) : undefined,
            ip: String(l.ipAddress ?? l.ip ?? ""),
            timestamp: l.timestamp as Date,
            status: (l.status || "INFO") as LogEntry["status"],
            category: (l.category || "SYSTEM") as LogEntry["category"]
          }))
        );
      } else {
        setError(logsResult.message || "Failed to load audit logs.");
      }

      if (metricsResult.success && metricsResult.data) {
        setMetrics(metricsResult.data as typeof metrics);
      }

      setIsRefreshing(false);
      setLoading(false);
      if (showToast) toast.success("Refreshed", "Audit logs updated.");
    },
    [categoryFilter, statusFilter]
  );

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  // KPI calculations
  const totalLogs = metrics.totalSecurityEvents || logs.length;
  const todayLogs = logs.filter((log) => new Date(log.timestamp).toDateString() === new Date().toDateString()).length;
  const warnings = metrics.systemWarnings;
  const critical = metrics.criticalThreatAlerts;

  // Client-side search on the fetched page of data
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        log.event.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        log.ip.includes(searchQuery)
    );
  }, [logs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRefresh = () => loadLogs(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to Export", "No audit entries match your criteria.");
      return;
    }
    const header = "Log ID,Timestamp,Event Description,Actor,Actor ID,IP Address,Category,Status";
    const rows = filtered.map((log) =>
      [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.event,
        log.actor,
        log.actorId || "",
        log.ip,
        log.category,
        log.status
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export Complete", `${filtered.length} audit entries exported.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="section-title mb-2">Compliance workspace</div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">System security and audit export logs</h1>
          <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
            Cryptographically signed security audit trail for regulatory compliance and incident review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)]"
          >
            <Download className="h-4 w-4" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{error}</div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Total Events</p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">{totalLogs}</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Today&apos;s Events</p>
            <p className="text-xl font-bold text-[color:var(--moss)]">{todayLogs}</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Warnings</p>
            <p className="text-xl font-bold text-amber-400">{warnings}</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Failures</p>
            <p className="text-xl font-bold text-[color:var(--clay)]">{critical}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs, actor, IP..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All Status" : s === "FAILURE" ? "Failure" : s}
              </option>
            ))}
          </select>

          {(searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] border border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <span className="text-[11px] text-slate-500 font-mono pl-1">{filtered.length} entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Live activity</h3>
          <div className={`status-pill ${critical > 0 ? "bg-[rgba(184,74,74,0.16)] text-[color:var(--clay)]" : "bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]"}`}>
            {loading ? "Loading…" : critical > 0 ? `${critical} failure${critical !== 1 ? "s" : ""}` : "Secure"}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Event Description</th>
                <th>Actor / ID</th>
                <th>IP Address</th>
                <th>Category</th>
                <th>Timestamp</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="animate-spin w-6 h-6 border-2 border-[color:var(--brass)] border-t-transparent rounded-full mx-auto mb-3" />
                    <span className="text-xs text-[color:var(--ledger-paper-dim)]">Loading audit trail…</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((log) => {
                  const status = statusConfig[log.status] || statusConfig.INFO;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={log.id} className="hover:bg-[rgba(198,154,76,0.04)] transition-colors">
                      <td className="mono-cell font-semibold text-[color:var(--brass)]">{log.id.slice(-8).toUpperCase()}</td>
                      <td className="font-medium">{log.event}</td>
                      <td className="mono-cell">
                        {log.actor}
                        {log.actorId && <span className="block text-[10px] text-slate-500">{log.actorId}</span>}
                      </td>
                      <td className="mono-cell">{log.ip}</td>
                      <td>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded">{log.category}</span>
                      </td>
                      <td className="text-[color:var(--ledger-paper-dim)] text-xs" title={new Date(log.timestamp).toLocaleString()}>
                        {relativeTime(log.timestamp)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <StatusIcon className={`w-3.5 h-3.5 ${status.text}`} />
                          <span className={`status-chip ${status.bg} ${status.text} border ${status.border}`}>{status.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  Search,
  Filter,
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

export const dynamic = "force-dynamic";

type LogEntry = {
  id: string;
  event: string;
  actor: string;
  actorId?: string;
  ip: string;
  time: string;
  timestamp: Date;
  status: "SUCCESS" | "WARNING" | "CRITICAL" | "INFO";
  category: "AUTH" | "TRANSACTION" | "BIOMETRIC" | "SYSTEM" | "USER";
};

// Extended mock data
const allLogs: LogEntry[] = [
  {
    id: "SEC-901",
    event: "Super Admin Login Success",
    actor: "Sarah Jenkins",
    actorId: "SA-90421",
    ip: "192.168.1.10",
    time: "10 mins ago",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: "SUCCESS",
    category: "AUTH",
  },
  {
    id: "SEC-902",
    event: "High-Value Withdrawal Approved ($85,000)",
    actor: "Dawit Wolde",
    actorId: "MGR-101",
    ip: "192.168.1.42",
    time: "25 mins ago",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    status: "SUCCESS",
    category: "TRANSACTION",
  },
  {
    id: "SEC-903",
    event: "Biometric Hardware Sensor Self-Test",
    actor: "SYSTEM_DAEMON",
    ip: "localhost",
    time: "1 hour ago",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: "SUCCESS",
    category: "BIOMETRIC",
  },
  {
    id: "SEC-904",
    event: "Failed Login Attempt (Exceeded Limit)",
    actor: "Unknown",
    ip: "192.168.1.55",
    time: "2 hours ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "WARNING",
    category: "AUTH",
  },
  {
    id: "SEC-905",
    event: "Role Assignment Changed",
    actor: "Frehiwot Tadesse",
    actorId: "MGR-102",
    ip: "192.168.1.12",
    time: "3 hours ago",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: "INFO",
    category: "USER",
  },
  {
    id: "SEC-906",
    event: "System Patch Applied",
    actor: "Solomon Tesfaye",
    actorId: "IT-001",
    ip: "localhost",
    time: "5 hours ago",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: "SUCCESS",
    category: "SYSTEM",
  },
  {
    id: "SEC-907",
    event: "Transaction Override (High Value)",
    actor: "Yonas Alemu",
    actorId: "MGR-103",
    ip: "192.168.1.78",
    time: "6 hours ago",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "CRITICAL",
    category: "TRANSACTION",
  },
  {
    id: "SEC-908",
    event: "Biometric Enrollment Failed",
    actor: "System",
    ip: "192.168.1.99",
    time: "8 hours ago",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    status: "WARNING",
    category: "BIOMETRIC",
  },
  {
    id: "SEC-909",
    event: "User Profile Updated",
    actor: "Bethelhem Haile",
    actorId: "ACT-401",
    ip: "192.168.1.23",
    time: "12 hours ago",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: "SUCCESS",
    category: "USER",
  },
  {
    id: "SEC-910",
    event: "Audit Log Export Triggered",
    actor: "System",
    ip: "192.168.1.1",
    time: "1 day ago",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "INFO",
    category: "SYSTEM",
  },
];

const PAGE_SIZE = 5;

// Status config for badges
const statusConfig = {
  SUCCESS: { label: "Success", bg: "bg-[color:var(--moss)]/15", text: "text-[color:var(--moss)]", border: "border-[color:var(--moss)]/30", icon: CheckCircle2 },
  WARNING: { label: "Warning", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", icon: AlertTriangle },
  CRITICAL: { label: "Critical", bg: "bg-[color:var(--clay)]/15", text: "text-[color:var(--clay)]", border: "border-[color:var(--clay)]/30", icon: ShieldAlert },
  INFO: { label: "Info", bg: "bg-slate-600/20", text: "text-slate-300", border: "border-slate-600/30", icon: ShieldQuestion },
};

const categoryOptions = ["ALL", "AUTH", "TRANSACTION", "BIOMETRIC", "SYSTEM", "USER"];

const statusOptions = ["ALL", "SUCCESS", "WARNING", "CRITICAL", "INFO"];

export default function SystemSecurityReportsPage() {
  const { toast, toasts, dismissToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KPI calculations
  const totalLogs = allLogs.length;
  const todayLogs = allLogs.filter(log =>
    log.timestamp.toDateString() === new Date().toDateString()
  ).length;
  const warnings = allLogs.filter(log => log.status === "WARNING").length;
  const critical = allLogs.filter(log => log.status === "CRITICAL").length;

  // Filter logs
  const filtered = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch =
        log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip.includes(searchQuery);
      const matchesCategory = categoryFilter === "ALL" || log.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Refreshed", "Audit logs updated.");
    }, 800);
  };

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
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)]">
            <Download className="h-4 w-4" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Events
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {totalLogs}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Today's Events
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">
              {todayLogs}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Warnings
            </p>
            <p className="text-xl font-bold text-amber-400">
              {warnings}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Critical
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">
              {critical}
            </p>
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
                {s === "ALL" ? "All Status" : s}
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

          <span className="text-[11px] text-slate-500 font-mono pl-1">
            {filtered.length} entries
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Live activity</h3>
          <div className="status-pill bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]">Secure</div>
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((log) => {
                  const status = statusConfig[log.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={log.id} className="hover:bg-[rgba(198,154,76,0.04)] transition-colors">
                      <td className="mono-cell font-semibold text-[color:var(--brass)]">{log.id}</td>
                      <td className="font-medium">{log.event}</td>
                      <td className="mono-cell">{log.actor}</td>
                      <td className="mono-cell">{log.ip}</td>
                      <td>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded">
                          {log.category}
                        </span>
                      </td>
                      <td className="text-[color:var(--ledger-paper-dim)] text-xs">{log.time}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <StatusIcon className={`w-3.5 h-3.5 ${status.text}`} />
                          <span className={`status-chip ${status.bg} ${status.text} border ${status.border}`}>
                            {status.label}
                          </span>
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
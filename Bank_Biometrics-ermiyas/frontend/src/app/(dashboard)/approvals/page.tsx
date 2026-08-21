"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Shield,
  RefreshCw, // ✅ Added
} from "lucide-react";
import { useApprovalStore } from "@/store/approvalStore";
import { getStoredUser } from "@/lib/auth";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 5;

export default function ApprovalsPage() {
  const {
    approvalRequests,
    pendingCount,
    loading,
    fetchPendingApprovals,
    approveRequest,
    rejectRequest,
  } = useApprovalStore();

  const { toast, toasts, dismissToast } = useToast();

  const [user, setUser] = useState<{ role: UserRole; branchId?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<{ id: string; show: boolean }>({ id: "", show: false });
  const [rejectReason, setRejectReason] = useState("");
  const [approveTarget, setApproveTarget] = useState<{ id: string; name: string } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  useEffect(() => {
    if (user?.role === "BANK_MANAGER") {
      fetchPendingApprovals(user.branchId);
    } else {
      fetchPendingApprovals();
    }
  }, [user, fetchPendingApprovals]);

  // Calculate KPIs
  const urgentCount = approvalRequests.filter((r) => r.priority === "URGENT" || r.priority === "High").length;
  const highCount = approvalRequests.filter((r) => r.priority === "HIGH" || r.priority === "High").length;
  const resolvedToday = 8; // Mock – would come from store

  // Filter approvals
  const filtered = useMemo(() => {
    return approvalRequests.filter((req) => {
      const matchesSearch =
        req.requestedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.targetRole?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        priorityFilter === "ALL" ||
        (req.priority || "MEDIUM").toUpperCase() === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [approvalRequests, searchQuery, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("ALL");
    setCurrentPage(1);
  };

  const handleApprove = (id: string, name: string) => {
    setApproveTarget({ id, name });
  };

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    const success = await approveRequest(approveTarget.id);
    setApproveTarget(null);
    if (success) {
      toast.success("Approved", `Request from ${approveTarget.name} has been approved.`);
    } else {
      toast.error("Failed", "Could not approve the request. Please try again.");
    }
  };

  const handleRejectClick = (id: string, name: string) => {
    setRejectTarget({ id, name });
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Reason Required", "Please provide a rejection reason.");
      return;
    }
    const success = await rejectRequest(rejectTarget.id, rejectReason);
    setRejectTarget(null);
    setRejectReason("");
    if (success) {
      toast.success("Rejected", `Request from ${rejectTarget.name} has been rejected.`);
    } else {
      toast.error("Failed", "Could not reject the request. Please try again.");
    }
  };
const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    SUPER_ADMIN_MANAGER: "Super Admin Manager",
    SUPER_ADMIN_IT: "Super Admin IT",
    SUPER_ADMIN_FOREX: "Super Admin FOREX",
    BANK_MANAGER: "Bank Manager",
    HR: "Human Resources",
    BRANCH_IT: "Branch IT",
    IT_SUPPORT: "IT Support",
    ACCOUNTANT: "Accountant",
  };

  return role ? labels[role] || role : "N/A";
};

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || "MEDIUM").toUpperCase();
    if (p === "URGENT" || p === "HIGH") {
      return <span className="status-chip fail">Urgent</span>;
    } else if (p === "MEDIUM") {
      return <span className="status-chip info">Medium</span>;
    } else {
      return <span className="status-chip pass">Low</span>;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "RQ";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Approval Queue</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            {user?.role === "BANK_MANAGER" ? "Branch clearance L3" : "Super Admin verification"} · Sign-off required for system changes and high-value transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (user?.role === "BANK_MANAGER") {
                fetchPendingApprovals(user.branchId);
              } else {
                fetchPendingApprovals();
              }
              toast.info("Refreshed", "Approval queue updated.");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Pending
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {pendingCount}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Urgent / High Priority
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">
              {urgentCount}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              High Priority
            </p>
            <p className="text-xl font-bold text-amber-400">
              {highCount}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Resolved Today
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">
              {resolvedToday}
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
            placeholder="Search by requester, request type, details..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => handlePriorityFilter(e.target.value)}
            className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {(searchQuery || priorityFilter !== "ALL") && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] border border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <span className="text-[11px] text-slate-500 font-mono pl-1">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Pending Sign-off Ledger</h3>
          <div className="flex items-center gap-3">
            <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">
              {filtered.length} items
            </span>
            <span className={`status-chip ${pendingCount > 0 ? "fail" : "pass"}`}>
              {pendingCount > 0 ? `${pendingCount} pending` : "All clear"}
            </span>
          </div>
        </div>

        <div className="queue-head-row">
          <span></span>
          <span>Request / Requester</span>
          <span>Target Role</span>
          <span>Priority</span>
          <span>Details</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[color:var(--brass)] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs text-[color:var(--ledger-paper-dim)]">Loading authorization requests...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-[color:var(--moss)]/40 mx-auto mb-3" />
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">No pending approvals.</p>
            <p className="text-xs text-[color:var(--ledger-paper-dim)]/60 mt-1">All caught up!</p>
          </div>
        ) : (
          paginated.map((req) => {
            const initials = getInitials(req.requestedByName);
            const priority = req.priority || "MEDIUM";

            return (
              <div className="queue-row" key={req.id}>
                <div className="q-avatar">{initials}</div>
                <div className="q-who">
                  <div className="q-n1 font-semibold">{req.requestedByName || "Unknown"}</div>
                  <div className="q-n2">{req.requestType || "Request"}</div>
                </div>
                <div className="status-chip pass" style={{ justifySelf: "start" }}>
                  {getRoleLabel(req.targetRole)}
                </div>
                <div>
                  {priority === "URGENT" || priority === "HIGH" ? (
                    <span className="status-chip fail">Urgent</span>
                  ) : priority === "MEDIUM" ? (
                    <span className="status-chip info">Medium</span>
                  ) : (
                    <span className="status-chip pass">Low</span>
                  )}
                </div>
                <div className="mono text-xs text-[color:var(--ledger-paper-dim)] max-w-[200px] truncate">
                  {req.details || "—"}
                </div>
                <div className="q-actions">
                  {req.status === "PENDING" ? (
                    <>
                      <button
                        className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-[color:var(--moss)]/20 text-slate-400 hover:text-[color:var(--moss)] transition-colors"
                        onClick={() => handleApprove(req.id, req.requestedByName || "Request")}
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-[color:var(--clay)]/20 text-slate-400 hover:text-[color:var(--clay)] transition-colors"
                        onClick={() => handleRejectClick(req.id, req.requestedByName || "Request")}
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className={`status-chip ${req.status === "APPROVED" ? "pass" : "fail"}`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[color:var(--line)]">
            <span className="text-[11px] text-[color:var(--ledger-paper-dim)] font-mono">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#0B192C] border border-[color:var(--line)] text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)] hover:border-[color:var(--brass)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-[color:var(--ledger-paper-dim)] px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-[#0B192C] border border-[color:var(--line)] text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)] hover:border-[color:var(--brass)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Approve Modal */}
      <ConfirmDialog
        isOpen={!!approveTarget}
        title="Approve Request"
        message={`Are you sure you want to approve the request from "${approveTarget?.name}"?`}
        confirmLabel="Approve"
        variant="info"
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Confirm Reject Modal with Reason */}
      <ConfirmDialog
        isOpen={!!rejectTarget}
        title="Reject Request"
        message={
          <div>
            <p className="text-[color:var(--ledger-paper-dim)] mb-3">
              Are you sure you want to reject the request from "{rejectTarget?.name}"?
            </p>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Rejection Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              className="w-full min-h-[80px] bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors resize-none placeholder:text-slate-500"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        }
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleRejectConfirm}
        onCancel={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
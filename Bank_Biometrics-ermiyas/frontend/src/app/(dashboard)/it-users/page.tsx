"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Pencil,
  Eye,
  KeyRound,
  Users,
  UserCheck,
  UserX,
  UserCog,
  HardDrive,
} from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export default function ITUsersListPage() {
  const { itUsers, deleteITUser, resetITUserPassword } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);

  // KPI calculations
  const totalUsers = itUsers.length;
  const activeUsers = itUsers.filter((u) => u.status === "ACTIVE").length;
  const suspendedUsers = itUsers.filter((u) => u.status === "SUSPENDED").length;
  const departments = new Set(itUsers.map((u) => u.department)).size;

  const filtered = useMemo(() => {
    return itUsers.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [itUsers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteITUser(deleteTarget.id);
    toast.success("IT User Removed", `${deleteTarget.name} has been deactivated.`);
    setDeleteTarget(null);
  };

  const handleResetPasswordConfirm = () => {
    if (!resetTarget) return;
    resetITUserPassword(resetTarget.id);
    toast.success("Password Reset", `Security credentials reset for ${resetTarget.name}.`);
    setResetTarget(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">IT User Management</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
              System administrators, infrastructure engineers, and technical support personnel.
            </p>
          </div>
          <Link
            href="/it-users/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add IT User</span>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
                Total IT Users
              </p>
              <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
                {totalUsers}
              </p>
            </div>
          </div>

          <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
                Active
              </p>
              <p className="text-xl font-bold text-[color:var(--moss)]">
                {activeUsers}
              </p>
            </div>
          </div>

          <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
                Suspended
              </p>
              <p className="text-xl font-bold text-[color:var(--clay)]">
                {suspendedUsers}
              </p>
            </div>
          </div>

          <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
                Departments
              </p>
              <p className="text-xl font-bold text-amber-400">
                {departments}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee ID, name, email, department..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  statusFilter === s
                    ? "bg-[color:var(--brass)]/15 border-[color:var(--brass)]/40 text-[color:var(--brass)]"
                    : "bg-[#0B192C] border-[#1E293B] text-slate-400 hover:text-slate-200"
                }`}
              >
                {s === "ALL" && <Filter className="w-3 h-3" />}
                {s === "ALL" ? "All Status" : s}
              </button>
            ))}
            <span className="text-[11px] text-slate-500 font-mono pl-1">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">IT Personnel</h3>
            <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">{filtered.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <UserX className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      No IT users found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgba(198,154,76,0.04)] transition-colors">
                      <td className="mono-cell font-semibold text-[color:var(--brass)]">{user.employeeId}</td>
                      <td className="font-semibold">{user.fullName}</td>
                      <td className="text-[color:var(--ledger-paper-dim)]">{user.email}</td>
                      <td>{user.department}</td>
                      <td className="mono-cell text-xs text-[color:var(--ledger-paper-dim)]">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td>
                        <StatusBadge status={user.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/it-users/details?id=${user.id}`}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/it-users/edit?id=${user.id}`}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
                            onClick={() => setResetTarget({ id: user.id, name: user.fullName })}
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            onClick={() => setDeleteTarget({ id: user.id, name: user.fullName })}
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove IT User"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"? This user will lose all system access immediately.`}
        confirmLabel="Remove User"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!resetTarget}
        title="Reset Password"
        message={`Reset security credentials for "${resetTarget?.name}"? They will receive a temporary password via institutional email.`}
        confirmLabel="Reset Password"
        variant="warning"
        onConfirm={handleResetPasswordConfirm}
        onCancel={() => setResetTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
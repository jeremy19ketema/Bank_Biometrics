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
  Code,
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-[color:var(--brass)]/10 text-[color:var(--brass)]">
                <Code className="w-4 h-4" />
              </div>
              <div className="text-xs uppercase tracking-wider text-[color:var(--brass)] font-semibold">System Access</div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              IT Personnel Management
            </h1>
            <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">
              System administrators, infrastructure engineers, and technical support personnel.
            </p>
          </div>
          <Link
            href="/it-users/create"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add IT User</span>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-[color:var(--brass)]/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-[color:var(--brass)]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)] font-semibold">
                Total IT Users
              </p>
            </div>
            <p className="text-3xl font-light text-white tracking-tight">
              {totalUsers}
            </p>
          </div>
          
          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-[color:var(--moss)]/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserCheck className="w-16 h-16 text-[color:var(--moss)]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)] font-semibold">
                Active Users
              </p>
            </div>
            <p className="text-3xl font-light text-white tracking-tight">
              {activeUsers}
            </p>
          </div>

          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-[color:var(--clay)]/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserX className="w-16 h-16 text-[color:var(--clay)]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)] font-semibold">
                Suspended
              </p>
            </div>
            <p className="text-3xl font-light text-white tracking-tight">
              {suspendedUsers}
            </p>
          </div>

          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-amber-400/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <HardDrive className="w-16 h-16 text-amber-400" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)] font-semibold">
                Departments
              </p>
            </div>
            <p className="text-3xl font-light text-white tracking-tight">
              {departments}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[20px] p-5 shadow-xl backdrop-blur-xl">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee ID, name, email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/40"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  statusFilter === s
                    ? "bg-[color:var(--brass)]/15 border-[color:var(--brass)]/40 text-[color:var(--brass)] shadow-sm"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {s === "ALL" && <Filter className="w-3.5 h-3.5" />}
                {s === "ALL" ? "All Status" : s}
              </button>
            ))}
            <div className="px-3 border-l border-white/10 hidden sm:block">
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
                {filtered.length} Record{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[color:var(--brass)] shadow-[0_0_8px_var(--brass)]"></div>
              <h3 className="text-base font-semibold text-white tracking-wide">IT Directory</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Employee ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Full Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Department</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Last Login</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <UserX className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-white/60 font-medium">No IT users found.</p>
                      <p className="text-sm text-white/40 mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-[color:var(--brass)] bg-[color:var(--brass)]/10 px-2 py-1 rounded-md border border-[color:var(--brass)]/20">{user.employeeId}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{user.department}</td>
                      <td className="px-6 py-4 font-mono text-xs text-white/50">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/it-users/details?id=${user.id}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-[color:var(--brass)]/15 border border-white/5 hover:border-[color:var(--brass)]/30 text-white/50 hover:text-[color:var(--brass)] transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/it-users/edit?id=${user.id}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white/50 hover:text-white transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 text-white/50 hover:text-amber-400 transition-all"
                            onClick={() => setResetTarget({ id: user.id, name: user.fullName })}
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/30 text-white/50 hover:text-rose-400 transition-all"
                            onClick={() => setDeleteTarget({ id: user.id, name: user.fullName })}
                            title="Remove User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/10 bg-white/5">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
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
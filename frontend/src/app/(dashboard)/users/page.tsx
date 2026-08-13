"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  KeyRound,
  UserCog,
  Building2,
  Globe,
  Code,
  Filter,
  X,
} from "lucide-react";
import { useSuperAdminStore, ITUser, FOREXUser } from "@/store/superAdminStore";
import { BankManager, StaffStatus } from "@/types";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";

// Unified user type
type UnifiedUser = {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "IT" | "Bank Manager" | "FOREX";
  status: StaffStatus;
  branchOrDepartment: string;
  lastLogin?: string;
  createdAt: string;
  // Original object reference for edit/delete
  original:
    | (ITUser & { type: "it" })
    | (BankManager & { type: "manager" })
    | (FOREXUser & { type: "forex" });
};

const PAGE_SIZE = 8;

const roleOptions = ["ALL", "IT", "Bank Manager", "FOREX"] as const;

export default function UsersPage() {
  const { itUsers, managers, forexUsers, deleteITUser, deleteManager, deleteFOREXUser, resetITUserPassword } =
    useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: "it" | "manager" | "forex" } | null>(
    null
  );
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string; type: "it" } | null>(null);

  // Combine all users into one unified list
  const allUsers = useMemo<UnifiedUser[]>(() => {
    const result: UnifiedUser[] = [];

    // IT Users
    itUsers.forEach((u) => {
      result.push({
        id: u.id,
        employeeId: u.employeeId,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: "IT",
        status: u.status,
        branchOrDepartment: u.department,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        original: { ...u, type: "it" },
      });
    });

    // Bank Managers
    managers.forEach((m) => {
      result.push({
        id: m.id,
        employeeId: m.employeeId,
        fullName: m.fullName,
        email: m.email,
        phone: m.phone,
        role: "Bank Manager",
        status: m.status,
        branchOrDepartment: m.branchName || "Unassigned",
        lastLogin: undefined, // managers don't have lastLogin in store
        createdAt: m.assignedDate || new Date().toISOString(),
        original: { ...m, type: "manager" },
      });
    });

    // FOREX Users
    forexUsers.forEach((f) => {
      result.push({
        id: f.id,
        employeeId: f.employeeId,
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        role: "FOREX",
        status: f.status,
        branchOrDepartment: f.specialization,
        lastLogin: undefined,
        createdAt: f.createdAt,
        original: { ...f, type: "forex" },
      });
    });

    // Sort by createdAt descending (newest first)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [itUsers, managers, forexUsers]);

  // Filter & search
  const filtered = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.branchOrDepartment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    if (type === "it") {
      deleteITUser(id);
      toast.success("User Removed", "IT user has been deactivated.");
    } else if (type === "manager") {
      deleteManager(id);
      toast.success("User Removed", "Manager has been removed.");
    } else if (type === "forex") {
      deleteFOREXUser(id);
      toast.success("User Removed", "FOREX user has been deactivated.");
    }
    setDeleteTarget(null);
  };

  const handleResetPasswordConfirm = () => {
    if (!resetTarget) return;
    resetITUserPassword(resetTarget.id);
    toast.success("Password Reset", `Security credentials reset for ${resetTarget.name}.`);
    setResetTarget(null);
  };

  // Helper to render action buttons
  const getEditUrl = (user: UnifiedUser) => {
    const original = user.original;
    if (original.type === "it") return `/it-users/edit?id=${user.id}`;
    if (original.type === "manager") return `/managers/edit?id=${user.id}`;
    if (original.type === "forex") return `/forex/edit?id=${user.id}`; // may not exist yet
    return "#";
  };

  const getDetailsUrl = (user: UnifiedUser) => {
    const original = user.original;
    if (original.type === "it") return `/it-users/details?id=${user.id}`;
    if (original.type === "manager") return `/managers/details?id=${user.id}`;
    if (original.type === "forex") return `/forex/details?id=${user.id}`;
    return "#";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">User Registry</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Manage all system users across the institution – IT, Managers, FOREX, and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/it-users/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add IT User</span>
          </Link>
          <Link
            href="/managers/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--moss)] hover:bg-[#5d8f6e] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--moss)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manager</span>
          </Link>
          <Link
            href="/forex/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass-dim)] hover:bg-[#a8894a] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass-dim)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add FOREX</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, ID, or department..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {roleOptions.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleFilter(role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                roleFilter === role
                  ? "bg-[color:var(--brass)]/15 border-[color:var(--brass)]/40 text-[color:var(--brass)]"
                  : "bg-[#0B192C] border-[#1E293B] text-slate-400 hover:text-slate-200"
              }`}
            >
              {role === "ALL" && <Filter className="w-3 h-3" />}
              {role === "ALL" ? "All Roles" : role}
            </button>
          ))}
          <span className="text-[11px] text-slate-500 font-mono pl-1">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">All Users</h3>
          <span className="mono text-xs text-ledger-paper-dim">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch / Department</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((user) => {
                  const isIT = user.role === "IT";
                  const isManager = user.role === "Bank Manager";
                  const isForex = user.role === "FOREX";

                  return (
                    <tr key={user.id} className="hover:bg-[rgba(198,154,76,0.04)] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[color:var(--brass)]/20 text-[color:var(--brass)] flex items-center justify-center font-bold text-xs">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[color:var(--ledger-paper)]">
                              {user.fullName}
                            </div>
                            <div className="text-[10px] text-[color:var(--ledger-paper-dim)] font-mono">
                              {user.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-[color:var(--ledger-paper-dim)]">{user.email}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {isIT && <Code className="w-3.5 h-3.5 text-blue-400" />}
                          {isManager && <Building2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {isForex && <Globe className="w-3.5 h-3.5 text-purple-400" />}
                          <span className="text-xs">{user.role}</span>
                        </div>
                      </td>
                      <td className="text-xs text-[color:var(--ledger-paper-dim)]">{user.branchOrDepartment}</td>
                      <td>
                        <StatusBadge status={user.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={getDetailsUrl(user)}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={getEditUrl(user)}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          {isIT && (
                            <button
                              onClick={() => setResetTarget({ id: user.id, name: user.fullName, type: "it" })}
                              className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: user.id,
                                name: user.fullName,
                                type: user.original.type,
                              })
                            }
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove User"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Remove User"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!resetTarget}
        title="Reset Password"
        message={`Reset security credentials for "${resetTarget?.name}"? They will receive a temporary password via email.`}
        confirmLabel="Reset Password"
        variant="warning"
        onConfirm={handleResetPasswordConfirm}
        onCancel={() => setResetTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
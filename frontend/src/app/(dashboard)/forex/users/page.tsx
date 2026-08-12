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
  Users,
  UserCheck,
  UserX,
  Globe,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"] as const;
const SPECIALIZATION_OPTIONS = ["ALL", "Currency Exchange", "Treasury Operations", "International Settlements"];

export default function FOREXUsersListPage() {
  const { forexUsers, deleteFOREXUser } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [specializationFilter, setSpecializationFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // KPI calculations
  const totalUsers = forexUsers.length;
  const activeUsers = forexUsers.filter((u) => u.status === "ACTIVE").length;
  const suspendedUsers = forexUsers.filter((u) => u.status === "SUSPENDED").length;
  const specializations = new Set(forexUsers.map((u) => u.specialization)).size;

  const filtered = useMemo(() => {
    return forexUsers.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      const matchesSpecialization = specializationFilter === "ALL" || user.specialization === specializationFilter;
      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [forexUsers, searchQuery, statusFilter, specializationFilter]);

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

  const handleSpecializationChange = (val: string) => {
    setSpecializationFilter(val);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteFOREXUser(deleteTarget.id);
    toast.success("FOREX User Removed", `${deleteTarget.name} has been deactivated.`);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">FOREX User Management</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
              Currency exchange dealers, treasury operators, and international settlements specialists.
            </p>
          </div>
          <Link
            href="/forex/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add FOREX User</span>
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
                Total FOREX Users
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
            <div className="w-10 h-10 rounded-xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
                Specializations
              </p>
              <p className="text-xl font-bold text-[color:var(--brass-dim)]">
                {specializations}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, email, specialization..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Status" : s}
                </option>
              ))}
            </select>

            <select
              value={specializationFilter}
              onChange={(e) => handleSpecializationChange(e.target.value)}
              className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
            >
              {SPECIALIZATION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Specializations" : s}
                </option>
              ))}
            </select>

            <span className="text-[11px] text-slate-500 font-mono pl-1">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">FOREX Personnel</h3>
            <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">{filtered.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Certification Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <UserX className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      No FOREX users found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgba(198,154,76,0.04)] transition-colors">
                      <td className="mono-cell font-semibold text-[color:var(--brass)]">{user.employeeId}</td>
                      <td className="font-semibold">{user.fullName}</td>
                      <td className="text-[color:var(--ledger-paper-dim)]">{user.email}</td>
                      <td>{user.specialization}</td>
                      <td>
                        <span className="text-xs text-[color:var(--brass)] font-medium">{user.certificationLevel}</span>
                      </td>
                      <td>
                        <StatusBadge status={user.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/forex/details?id=${user.id}`}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/forex/edit?id=${user.id}`}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
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
        title="Remove FOREX User"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Remove User"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
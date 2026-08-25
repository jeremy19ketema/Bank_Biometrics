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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">FOREX User Management</h1>
            <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">
              Currency exchange dealers, treasury operators, and international settlements specialists.
            </p>
          </div>
          <Link
            href="/forex/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] text-sm font-bold transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add FOREX User</span>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--brass)]/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--brass)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Total FOREX Users</p>
                <p className="text-2xl font-bold text-white mt-0.5">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--moss)]/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--moss)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(76,122,94,0.1)]">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Active</p>
                <p className="text-2xl font-bold text-[color:var(--moss)] mt-0.5">{activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-[color:var(--clay)]/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--clay)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,119,108,0.1)]">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Suspended</p>
                <p className="text-2xl font-bold text-[color:var(--clay)] mt-0.5">{suspendedUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl group hover:border-white/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/70 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">Specializations</p>
                <p className="text-2xl font-bold text-white mt-0.5">{specializations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[20px] p-4 shadow-xl backdrop-blur-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#0f1728] text-white">
                  {s === "ALL" ? "All Status" : s}
                </option>
              ))}
            </select>
            <select
              value={specializationFilter}
              onChange={(e) => handleSpecializationChange(e.target.value)}
              className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all"
            >
              {SPECIALIZATION_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#0f1728] text-white">
                  {s === "ALL" ? "All Specializations" : s}
                </option>
              ))}
            </select>
            <span className="text-xs text-white/40 font-mono font-medium whitespace-nowrap pl-2">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] shadow-xl backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">FOREX Personnel</h3>
            <span className="text-xs font-mono text-[color:var(--brass)] bg-[color:var(--brass)]/10 px-3 py-1.5 rounded-full border border-[color:var(--brass)]/20">{filtered.length} active entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider">Employee ID</th>
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider">Full Name</th>
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider">Email</th>
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider">Specialization</th>
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider">Certification</th>
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-8 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-white/40">
                      <UserX className="w-8 h-8 text-white/20 mx-auto mb-3" />
                      <p className="font-medium">No FOREX users found.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 px-8 font-mono text-sm font-semibold text-[color:var(--brass)]">{user.employeeId}</td>
                      <td className="py-5 px-8 text-sm text-white font-medium">{user.fullName}</td>
                      <td className="py-5 px-8 text-sm text-white/60">{user.email}</td>
                      <td className="py-5 px-8 text-sm text-white/80">{user.specialization}</td>
                      <td className="py-5 px-8">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-[color:var(--brass)] bg-[color:var(--brass)]/10 border border-[color:var(--brass)]/20 uppercase tracking-wider">{user.certificationLevel}</span>
                      </td>
                      <td className="py-5 px-8">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/forex/details?id=${user.id}`}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/5 hover:border-white/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/forex/edit?id=${user.id}`}
                            className="p-2 rounded-lg bg-white/5 hover:bg-[color:var(--brass)]/10 text-white/50 hover:text-[color:var(--brass)] transition-colors border border-white/5 hover:border-[color:var(--brass)]/30"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 rounded-lg bg-white/5 hover:bg-[color:var(--clay)]/10 text-white/50 hover:text-[color:var(--clay)] transition-colors border border-white/5 hover:border-[color:var(--clay)]/30"
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
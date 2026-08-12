"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle,
  XCircle,
  Wrench,
  Plus,
  Search,
  LayoutGrid,
  Table,
  Eye,
  Pencil,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function BranchesListPage() {
  const { branches, deleteBranch } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Calculate KPI stats
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === "ACTIVE").length;
  const inactiveBranches = branches.filter((b) => b.status === "INACTIVE").length;
  const maintenanceBranches = branches.filter((b) => b.status === "MAINTENANCE").length;

  const cities = useMemo(() => {
    const set = new Set(branches.map((b) => b.city));
    return Array.from(set);
  }, [branches]);

  const filtered = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchesCity = cityFilter === "ALL" || b.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [branches, searchQuery, statusFilter, cityFilter]);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteBranch(deleteTarget.id);
    toast.success("Branch Removed", `${deleteTarget.name} has been decommissioned.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Branches
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {totalBranches}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Active
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">
              {activeBranches}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Inactive
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">
              {inactiveBranches}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Maintenance
            </p>
            <p className="text-xl font-bold text-amber-400">
              {maintenanceBranches}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search branch code, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors placeholder:text-slate-500"
            />
          </div>

          <select
            className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            className="bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="ALL">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {(searchQuery || statusFilter !== "ALL" || cityFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setCityFilter("ALL");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B192C] border border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0B192C] border border-[#1E293B] rounded-lg p-1">
            <button
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-[color:var(--brass)]/20 text-[color:var(--brass)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-[color:var(--brass)]/20 text-[color:var(--brass)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/branches/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="branch-grid">
          {filtered.length === 0 ? (
            <div className="col-span-full panel text-center py-12">
              <Building2 className="w-12 h-12 text-[color:var(--ledger-paper-dim)]/30 mx-auto mb-4" />
              <p className="text-[color:var(--ledger-paper-dim)]">No branches found matching your search.</p>
              <Link
                href="/branches/create"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Branch</span>
              </Link>
            </div>
          ) : (
            filtered.map((b) => (
              <div className="branch-card" key={b.id}>
                <div className="bc-head">
                  <div>
                    <div className="bc-code">{b.code}</div>
                    <div className="bc-name display">{b.name}</div>
                    <div className="bc-loc">{b.city} &nbsp;·&nbsp; {b.address}</div>
                  </div>
                  <div className="vault-dial" style={{ width: "48px", height: "48px" }}>
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      <circle className="track" cx="24" cy="24" r="19" strokeWidth="4" />
                      <circle
                        className={`arc ${b.status === "ACTIVE" ? "moss" : b.status === "MAINTENANCE" ? "clay" : ""}`}
                        cx="24"
                        cy="24"
                        r="19"
                        strokeWidth="4"
                        strokeDasharray="119.4"
                        strokeDashoffset={b.status === "ACTIVE" ? 12 : 55}
                      />
                    </svg>
                  </div>
                </div>

                <div className="bc-metrics">
                  <div className="bm">
                    <div className="v">{b.tellerCount || 8}</div>
                    <div className="l">Terminals</div>
                  </div>
                  <div className="bm">
                    <div className="v">${((b.dailyTransactionLimit || 1000000) / 1000000).toFixed(1)}M</div>
                    <div className="l">Daily Limit</div>
                  </div>
                  <div className="bm">
                    <div className="v">{b.managerName?.split(" ")[0] || "Unassigned"}</div>
                    <div className="l">Manager</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-sm border-t border-[color:var(--line)]">
                  <span className={`status-chip ${b.status === "ACTIVE" ? "pass" : b.status === "MAINTENANCE" ? "info" : "fail"}`}>
                    {b.status}
                  </span>
                  <div className="flex gap-1.5">
                    <Link
                      href={`/branches/details?id=${b.id}`}
                      className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/branches/edit?id=${b.id}`}
                      className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Edit Branch"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      onClick={() => setDeleteTarget({ id: b.id, name: b.name })}
                      title="Decommission Branch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">Branch Ledger</h3>
            <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">{filtered.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Branch Name</th>
                  <th>City</th>
                  <th>Manager</th>
                  <th style={{ textAlign: "right" }}>Limit</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="mono-cell">{b.code}</td>
                    <td className="font-semibold">{b.name}</td>
                    <td>{b.city}</td>
                    <td className="mono-cell">{b.managerName || "Unassigned"}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell">
                      ${b.dailyTransactionLimit?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`status-chip ${b.status === "ACTIVE" ? "pass" : b.status === "MAINTENANCE" ? "info" : "fail"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/branches/details?id=${b.id}`}
                          className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/branches/edit?id=${b.id}`}
                          className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Edit Branch"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          onClick={() => setDeleteTarget({ id: b.id, name: b.name })}
                          title="Decommission Branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Decommission Branch"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? All associated records will be archived.`}
        confirmLabel="Decommission"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
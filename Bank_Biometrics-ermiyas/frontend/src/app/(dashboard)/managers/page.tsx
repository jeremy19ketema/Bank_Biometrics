"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 5;

export default function BankManagerListPage() {
  const { managers, branches, deleteManager } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    return managers.filter((mgr) => {
      const matchesSearch =
        mgr.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mgr.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mgr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mgr.branchName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = branchFilter === "ALL" || mgr.branchId === branchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [managers, searchQuery, branchFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteManager(deleteTarget.id);
    toast.success("Manager Removed", `${deleteTarget.name} has been removed.`);
    setDeleteTarget(null);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  const getStatusBadge = (status: string) => {
    if (status === "ACTIVE")
      return <span className="status-chip pass">Active</span>;
    if (status === "ON_LEAVE")
      return <span className="status-chip info">On Leave</span>;
    return <span className="status-chip fail">Suspended</span>;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Institutional Bank Managers</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Manage access, roles, and branch assignments for all banking personnel.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-mini">Export</button>
            <Link href="/managers/create" className="btn-primary flex items-center gap-2">+ Add Manager</Link>
          </div>
        </div>

        <div className="ledger-panel">
          <div className="ledger-head">
            <div className="flex items-center gap-4">
              <div className="search-box" style={{ width: "200px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
              </div>
              <select className="input-field rounded h-[38px] px-sm font-mono text-xs" value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">All Branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <span className="mono text-xs text-ledger-paper-dim">{filtered.length} entries</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Branch</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No managers found.</td></tr>
              ) : (
                paginated.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[color:var(--brass)]/20 text-[color:var(--brass)] flex items-center justify-center font-bold text-xs">{getInitials(m.fullName)}</div>
                        <span className="font-semibold">{m.fullName}</span>
                      </div>
                    </td>
                    <td className="mono-cell">{m.employeeId.toLowerCase().replace("-", ".")}</td>
                    <td>{m.branchName}</td>
                    <td><div className="text-xs">{m.email}<br /><span className="text-ledger-paper-dim">{m.phone}</span></div></td>
                    <td>{getStatusBadge(m.status)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-2">
                        <Link href={`/managers/edit?id=${m.id}`} className="btn-mini">Edit</Link>
                        <Link href={`/managers/details?id=${m.id}`} className="btn-mini">View</Link>
                        <button className="btn-mini decline" onClick={() => setDeleteTarget({ id: m.id, name: m.fullName })}>Revoke</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="p-md border-t border-line flex items-center justify-between">
            <span className="text-xs text-ledger-paper-dim">Showing {paginated.length} of {filtered.length}</span>
            <div className="flex gap-2">
              <button className="btn-mini" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>←</button>
              <span className="btn-mini">{currentPage} / {totalPages}</span>
              <button className="btn-mini" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>→</button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Revoke Manager Access"
        message={`Are you sure you want to revoke access for "${deleteTarget?.name}"? Their branch assignment will be removed.`}
        confirmLabel="Revoke Access"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
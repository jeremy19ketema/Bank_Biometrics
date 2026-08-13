"use client";

import React, { useEffect, useState } from "react";
import { useHRStore } from "@/store/hrStore";
import {
  Users,
  UserPlus,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function HRDashboardPage() {
  const { stats, loading, fetchDashboardStats, createStaffRequest } = useHRStore();
  const { toast, toasts, dismissToast } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "BANK_MANAGER",
    branchId: "",
    passcode: "",
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.email || !formData.passcode) {
      toast.error("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const success = await createStaffRequest(formData);
    if (success) {
      toast.success("Success", `${formData.role.replace(/_/g, " ")} created and sent for Super Admin approval.`);
      setShowCreateModal(false);
      setFormData({
        username: "",
        fullName: "",
        email: "",
        role: "BANK_MANAGER",
        branchId: "",
        passcode: "",
      });
      fetchDashboardStats();
    } else {
      toast.error("Error", "Failed to create staff member. Check console or try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Human Resources Dashboard</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Manage personnel, track staffing requests, and monitor employee statistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#16233A] font-bold text-xs transition-colors shadow-lg shadow-[color:var(--brass)]/20"
          >
            <UserPlus className="w-4 h-4" />
            Create Staff
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Users Created
            </p>
            <p className="text-2xl font-bold text-[color:var(--ledger-paper)]">
              {stats.totalUsersCreated}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Pending Approvals
            </p>
            <p className="text-2xl font-bold text-amber-400">
              {stats.pendingApprovals}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Active Employees
            </p>
            <p className="text-2xl font-bold text-[color:var(--moss)]">
              {stats.activeEmployees}
            </p>
          </div>
        </div>
      </div>

      {/* HR Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">Recent Staffing Requests</h3>
            <span className="status-chip info">View All</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg bg-[#0B192C] border border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">JD</div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">John Doe</p>
                  <p className="text-xs text-slate-400">BANK MANAGER</p>
                </div>
              </div>
              <span className="status-chip warn">Pending</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0B192C] border border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">AS</div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Alice Smith</p>
                  <p className="text-xs text-slate-400">SUPER ADMIN IT</p>
                </div>
              </div>
              <span className="status-chip pass">Approved</span>
            </div>
          </div>
        </div>

        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">HR Bulletins & Policies</h3>
            <FileText className="w-4 h-4 text-[color:var(--ledger-paper-dim)]" />
          </div>
          <div className="p-4">
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[color:var(--moss)]"/> Q3 Performance Reviews due Nov 15.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[color:var(--moss)]"/> Open Enrollment begins next month.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[color:var(--moss)]"/> New IT onboarding protocol established.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Staff</h3>
                <p className="text-xs text-slate-400 mt-1">Submit a request to provision a new employee account.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="e.g. janedoe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="jane@bank.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                  >
                    <option value="BANK_MANAGER">Bank Manager</option>
                    <option value="SUPER_ADMIN_IT">Super Admin IT</option>
                    <option value="SUPER_ADMIN_FOREX">Super Admin Forex</option>
                    <option value="BRANCH_IT">Branch IT</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>
              </div>

              {["BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT"].includes(formData.role) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="Leave blank for unassigned"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Initial Passcode</label>
                <input
                  type="password"
                  required
                  value={formData.passcode}
                  onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                  className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                  placeholder="Set temporary password"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#16233A] text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  {loading && <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

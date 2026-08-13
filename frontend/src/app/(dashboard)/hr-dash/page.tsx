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
  FileText,
  BadgeCheck
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

  const metrics = [
    {
      label: "Total users created",
      value: stats.totalUsersCreated.toString(),
      delta: "+5 this week",
      icon: Users,
    },
    {
      label: "Pending approvals",
      value: stats.pendingApprovals.toString(),
      delta: "2 urgent",
      icon: Clock,
    },
    {
      label: "Active employees",
      value: stats.activeEmployees.toString(),
      delta: "+1.2%",
      icon: Building2,
    },
    {
      label: "Compliance score",
      value: "99.4%",
      delta: "Stable",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section matching advanced styling */}
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">HR Operations</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Human Resources Control Center
            </h1>
            <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
              Manage personnel, track staffing requests, and monitor employee statistics across all branches.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)]"
          >
            <UserPlus className="h-4 w-4 text-[color:var(--brass)]" />
            Create Staff
          </button>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-5 shadow-[0_16px_40px_rgba(2,8,23,0.28)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ledger-paper-dim)]">{metric.label}</span>
                <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
                {metric.value}
              </div>
              <div className="mt-2 text-xs text-[color:var(--ledger-paper-dim)]">
                {metric.delta}
              </div>
            </div>
          );
        })}
      </section>

      {/* HR Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)]">Recent Staffing Requests</h3>
            <span className="text-xs font-semibold text-[color:var(--brass)] cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-[20px] bg-[rgba(15,23,40,0.6)] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(198,154,76,0.12)] flex items-center justify-center text-[color:var(--brass)] font-bold text-sm border border-[color:var(--brass)]/20">JD</div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">John Doe</p>
                  <p className="text-xs text-[color:var(--ledger-paper-dim)]">BANK MANAGER</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">Pending</span>
            </div>
            <div className="p-4 rounded-[20px] bg-[rgba(15,23,40,0.6)] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(76,122,94,0.12)] flex items-center justify-center text-[color:var(--moss)] font-bold text-sm border border-[color:var(--moss)]/20">AS</div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Alice Smith</p>
                  <p className="text-xs text-[color:var(--ledger-paper-dim)]">SUPER ADMIN IT</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20 text-xs font-semibold">Approved</span>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)]">HR Bulletins & Policies</h3>
            <FileText className="w-5 h-5 text-[color:var(--brass)]" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--moss)] shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-medium text-slate-200">Q3 Performance Reviews due Nov 15.</p>
                <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Please ensure all department heads submit reviews via the portal.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--moss)] shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-medium text-slate-200">Open Enrollment begins next month.</p>
                <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Health and benefits enrollment details will be distributed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--moss)] shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-medium text-slate-200">New IT onboarding protocol established.</p>
                <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Updated security checks required for all new IT staff.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.95)] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.6)] backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Create New Staff</h3>
                <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">Submit a request to provision a new employee account.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="e.g. janedoe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="jane@bank.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors appearance-none"
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
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Branch ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                    placeholder="Leave blank for unassigned"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Initial Passcode</label>
                <input
                  type="password"
                  required
                  value={formData.passcode}
                  onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                  className="w-full bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-colors"
                  placeholder="Set temporary password"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#16233A] text-sm font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  {loading && <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
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

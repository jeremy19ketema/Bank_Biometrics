"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Clock,
  AlertCircle,
  ShieldCheck,
  Settings,
  FileText,
  UserCog,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { reportApi, DashboardMetrics } from "@/services/reportApi";

export default function SuperAdminDashboard() {
  const { branches, managers, itUsers } = useSuperAdminStore();
  const { toasts, dismissToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<DashboardMetrics>({});

  React.useEffect(() => {
    reportApi.getDashboardMetrics().then(res => {
      if (res.success && res.data) setMetrics(res.data);
    });
  }, []);

  const activeBranchesCount = branches.filter((b) => b.status === "ACTIVE").length || 142;
  const totalUsers = metrics.totalStaff || managers.length + itUsers.length + 2; 
  const pendingApprovals = metrics.pendingApprovals || 0; 
  const systemUptime = "99.97%";

  // Mock system activity
  const systemActivities = [
    { id: 1, event: "New branch created: BR-043 – Addis Ababa", time: "10 mins ago", status: "Success" },
    { id: 2, event: "Role permissions updated for IT department", time: "25 mins ago", status: "Success" },
    { id: 3, event: "Security patch v4.2 deployed globally", time: "1 hour ago", status: "Info" },
    { id: 4, event: "Branch manager access revoked: MGR-102 (Temp)", time: "2 hours ago", status: "Warning" },
  ];

  // Mock chart data – daily verification volume (Mon-Sun)
  const chartData = [
    { day: "Mon", volume: 42000 },
    { day: "Tue", volume: 38000 },
    { day: "Wed", volume: 55000 },
    { day: "Thu", volume: 48000 },
    { day: "Fri", volume: 62000 },
    { day: "Sat", volume: 28000 },
    { day: "Sun", volume: 15000 },
  ];

  const maxVolume = Math.max(...chartData.map((d) => d.volume));
  const chartHeight = 140;

  return (
    <div className="space-y-6">
      {/* Header & Top Action Bar */}
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Super Admin Control Center</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              {activeTab === "overview" ? "Overview & Actions" : "Global Settings"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/super-admin/users/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brass)] px-4 py-2.5 text-sm font-bold text-[#16233A] shadow-lg transition hover:bg-[#d7ab5c]"
            >
              <UserPlus className="h-4 w-4" /> Create System User
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "overview" ? "text-[color:var(--brass)]" : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[color:var(--brass)] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "settings" ? "text-[color:var(--brass)]" : "text-slate-400 hover:text-white"
            }`}
          >
            Global Settings & Policies
            {activeTab === "settings" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[color:var(--brass)] rounded-t-full" />
            )}
          </button>
        </div>
      </section>

      {activeTab === "overview" ? (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Active Branches
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {activeBranchesCount}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Users
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {totalUsers}
            </p>
          </div>
        </div>

        <Link href="/approvals" className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4 hover:border-[color:var(--clay)] transition-colors group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center group-hover:bg-[color:var(--clay)] group-hover:text-white transition-colors">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--clay)] transition-colors">
              Pending Approvals
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">
              {pendingApprovals}
            </p>
          </div>
        </Link>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              System Uptime
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {systemUptime}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles – 3×2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/super-admin/organizations"
          className="panel hover:border-[color:var(--brass)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="20" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass)] transition-colors">
              Organization Hierarchy
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Manage regions, branches, departments, and cost centers.
            </p>
          </div>
        </Link>

        <Link
          href="/super-admin/roles"
          className="panel hover:border-[color:var(--moss)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center group-hover:bg-[color:var(--moss)] group-hover:text-[#0F1B2B] transition-colors">
                <UserCog className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc moss" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="40" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--moss)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--moss)] transition-colors">
              Roles & Permissions
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Define custom roles and strictly scope them across the network.
            </p>
          </div>
        </Link>

        <Link
          href="/reports/system"
          className="panel hover:border-[color:var(--brass-dim)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass-dim)] group-hover:text-[#0F1B2B] transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="60" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass-dim)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass-dim)] transition-colors">
              Audit Logs
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Review system activity logs for compliance and security.
            </p>
          </div>
        </Link>

        <Link
          href="/settings/system"
          className="panel hover:border-[color:var(--brass)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
                <Settings className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="30" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass)] transition-colors">
              System Settings
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Configure security thresholds, biometric settings, and global parameters.
            </p>
          </div>
        </Link>

        <Link
          href="/accountants"
          className="panel hover:border-[color:var(--moss)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center group-hover:bg-[color:var(--moss)] group-hover:text-[#0F1B2B] transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc moss" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="35" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--moss)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--moss)] transition-colors">
              User Management
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              View and manage all system users across the institution.
            </p>
          </div>
        </Link>

        <Link
          href="/reports/system"
          className="panel hover:border-[color:var(--brass-dim)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass-dim)] group-hover:text-[#0F1B2B] transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="50" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass-dim)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass-dim)] transition-colors">
              Generate Reports
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Export compliance reports, user activity summaries, and system health data.
            </p>
          </div>
        </Link>

        <Link
          href="/super-admin/security"
          className="panel hover:border-[color:var(--clay)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center group-hover:bg-[color:var(--clay)] group-hover:text-white transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc clay" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="60" />
                </svg>
              </div>
            </div>
            <span className="material-symbols-outlined text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--clay)] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--clay)] transition-colors">
              Security & Compliance
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Audit trails, policy maker-checker, and security alerts.
            </p>
          </div>
        </Link>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Verification Volume */}
        <div className="panel">
          <h3 className="display">Daily Verification Volume</h3>
          <div className="panel-sub">This week – total biometric verifications per day</div>
          <div
            className="flex items-end gap-3"
            style={{ height: `${chartHeight + 30}px`, paddingTop: "10px" }}
          >
            {chartData.map((item) => {
              const barHeight = Math.max((item.volume / maxVolume) * chartHeight, 8);
              return (
                <div
                  key={item.day}
                  className="flex flex-col items-center gap-1 flex-1 h-full justify-end"
                >
                  <div
                    className="w-full rounded-sm transition-all duration-300 hover:brightness-125"
                    style={{
                      height: `${barHeight}px`,
                      background: `linear-gradient(180deg, var(--brass), var(--brass-dim))`,
                      minHeight: "6px",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                  <span className="font-mono text-[10px] text-[color:var(--ledger-paper-dim)]">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-[color:var(--ledger-paper-dim)] font-mono mt-2">
            <span>{chartData[0].volume.toLocaleString()}</span>
            <span>{chartData[3].volume.toLocaleString()}</span>
            <span>{chartData[6].volume.toLocaleString()}</span>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="panel">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="display">Recent System Activity</h3>
              <div className="panel-sub">Institution‑wide events</div>
            </div>
            <Clock className="w-4 h-4 text-[color:var(--ledger-paper-dim)]" />
          </div>
          <div className="space-y-3 mt-2">
            {systemActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[rgba(15,23,40,0.4)] border border-[color:var(--line)] hover:border-[color:var(--line-strong)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {activity.status === "Warning" ? (
                    <div className="w-8 h-8 rounded-full bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[color:var(--ledger-paper)] truncate">
                      {activity.event}
                    </p>
                    <p className="text-xs text-[color:var(--ledger-paper-dim)]">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-[0.06em] ${
                    activity.status === "Warning"
                      ? "text-[color:var(--clay)]"
                      : activity.status === "Info"
                      ? "text-[color:var(--ledger-paper-dim)]"
                      : "text-[color:var(--moss)]"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[color:var(--line)]">
            <Link
              href="/reports/system"
              className="text-xs font-mono text-[color:var(--brass)] hover:underline flex items-center gap-1"
            >
              View full audit log →
            </Link>
          </div>
        </div>
      </div>
        </>
      ) : activeTab === "settings" ? (
        <div className="space-y-6">
          <div className="panel">
            <h2 className="display flex items-center gap-2"><Settings className="w-5 h-5 text-[color:var(--brass)]" /> Security Policies</h2>
            <div className="panel-sub mb-4">Configure global security requirements for all users.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-white mb-1">MFA Enforcement</div>
                <div className="text-xs text-slate-400">Currently disabled globally</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-white mb-1">Session Timeout</div>
                <div className="text-xs text-slate-400">30 minutes</div>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[color:var(--brass)]/10 text-[color:var(--brass)] hover:bg-[color:var(--brass)]/20 transition-colors">Edit Security Policy</button>
          </div>

          <div className="panel">
            <h2 className="display flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[color:var(--moss)]" /> Biometric Policies</h2>
            <div className="panel-sub mb-4">Manage enrollment requirements and retention data.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-white mb-1">Data Retention</div>
                <div className="text-xs text-slate-400">365 Days</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-white mb-1">Strict Match Threshold</div>
                <div className="text-xs text-slate-400">85.0%</div>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[color:var(--moss)]/10 text-[color:var(--moss)] hover:bg-[color:var(--moss)]/20 transition-colors">Edit Biometric Policy</button>
          </div>
          
          <div className="panel">
            <h2 className="display flex items-center gap-2"><AlertCircle className="w-5 h-5 text-[color:var(--clay)]" /> System Integrations & Alerts</h2>
            <div className="panel-sub mb-4">Manage API keys and view critical security alerts.</div>
            <div className="h-20 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-slate-500">
              No active integrations configured.
            </div>
          </div>
        </div>
      ) : null}



      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
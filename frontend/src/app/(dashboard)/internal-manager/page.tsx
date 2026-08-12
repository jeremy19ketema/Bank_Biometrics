"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  HardDrive,
  DollarSign,
  Activity,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function InternalManagerDashboard() {
  const pendingApprovals = [
    {
      id: "apr-1",
      type: "IT Access Request",
      requester: "Solomon Tesfaye",
      department: "Infrastructure & Security",
      details: "VPN access for remote diagnostics",
      submitted: "10:42 UTC",
      priority: "High",
    },
    {
      id: "apr-2",
      type: "FOREX Transaction",
      requester: "Tigist Kebede",
      department: "Currency Exchange",
      details: "Cross-currency settlement: USD/ETB 450,000",
      submitted: "10:38 UTC",
      priority: "Urgent",
    },
    {
      id: "apr-3",
      type: "IT System Change",
      requester: "Bethlehem Amare",
      department: "Database Admin",
      details: "Schema migration for audit compliance",
      submitted: "10:15 UTC",
      priority: "Medium",
    },
    {
      id: "apr-4",
      type: "FOREX Limit Increase",
      requester: "Meseret Yilma",
      department: "Treasury Operations",
      details: "Daily FX trading limit increase to $2M",
      submitted: "09:55 UTC",
      priority: "High",
    },
  ];

  const quickActions = [
    { label: "Review All Approvals", icon: CheckCircle2, href: "/approvals", color: "text-[color:var(--brass)]" },
    { label: "Manage IT Users", icon: Users, href: "/it-users", color: "text-blue-400" },
    { label: "View Reports", icon: FileText, href: "/reports/system", color: "text-purple-400" },
  ];

  const recentActivities = [
    { id: 1, event: "Approved IT access request for Solomon Tesfaye", time: "12 mins ago", status: "success" },
    { id: 2, event: "FOREX transaction approved: USD/ETB 450,000", time: "25 mins ago", status: "success" },
    { id: 3, event: "Rejected duplicate IT system change request", time: "1 hour ago", status: "warning" },
    { id: 4, event: "FOREX dealer limit increased to $2M", time: "2 hours ago", status: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              IT Staff
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">8</p>
            <p className="text-[10px] text-[color:var(--ledger-paper-dim)]">Engineers</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              FOREX Dealers
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">6</p>
            <p className="text-[10px] text-[color:var(--ledger-paper-dim)]">Traders</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Pending Approvals
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">{pendingApprovals.length}</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Completed Today
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">14</p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Pending Authorization Requests</h3>
          <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">
            {pendingApprovals.length} items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Request Type</th>
                <th>Requester</th>
                <th>Department</th>
                <th>Details</th>
                <th>Priority</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((req) => (
                <tr key={req.id} className="hover:bg-[rgba(198,154,76,0.04)] transition-colors">
                  <td className="font-semibold">{req.type}</td>
                  <td>{req.requester}</td>
                  <td className="text-[color:var(--ledger-paper-dim)]">{req.department}</td>
                  <td className="text-[color:var(--ledger-paper-dim)]">{req.details}</td>
                  <td>
                    <span
                      className={`status-chip ${
                        req.priority === "Urgent"
                          ? "fail"
                          : req.priority === "High"
                          ? "info"
                          : "pass"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex justify-end gap-1.5">
                      <button
                        className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-[color:var(--moss)]/20 text-slate-400 hover:text-[color:var(--moss)] transition-colors"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-[color:var(--clay)]/20 text-slate-400 hover:text-[color:var(--clay)] transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Review Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Summaries & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IT Department */}
        <div className="panel">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="w-5 h-5 text-[color:var(--brass)]" />
            <h3 className="display">IT Department</h3>
          </div>
          <div className="panel-sub">8 Engineers · 5 projects</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-[color:var(--line)] pb-2">
              <span className="text-[color:var(--ledger-paper-dim)]">Total Staff</span>
              <span className="font-semibold text-[color:var(--ledger-paper)]">8 Engineers</span>
            </div>
            <div className="flex justify-between border-b border-[color:var(--line)] pb-2">
              <span className="text-[color:var(--ledger-paper-dim)]">Active Projects</span>
              <span className="font-semibold text-[color:var(--ledger-paper)]">5</span>
            </div>
            <div className="flex justify-between border-b border-[color:var(--line)] pb-2">
              <span className="text-[color:var(--ledger-paper-dim)]">Open Tickets</span>
              <span className="font-semibold text-[color:var(--clay)]">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--ledger-paper-dim)]">System Uptime</span>
              <span className="font-semibold text-[color:var(--moss)]">99.97%</span>
            </div>
          </div>
        </div>

        {/* FOREX Department */}
        <div className="panel">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-[color:var(--brass)]" />
            <h3 className="display">FOREX Department</h3>
          </div>
          <div className="panel-sub">6 Dealers · $2.4M today</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-[color:var(--line)] pb-2">
              <span className="text-[color:var(--ledger-paper-dim)]">Total Dealers</span>
              <span className="font-semibold text-[color:var(--ledger-paper)]">6 Traders</span>
            </div>
            <div className="flex justify-between border-b border-[color:var(--line)] pb-2">
              <span className="text-[color:var(--ledger-paper-dim)]">Today's Volume</span>
              <span className="font-semibold text-[color:var(--ledger-paper)]">$2.4M</span>
            </div>
            <div className="flex justify-between border-b border-[color:var(--line)] pb-2">
              <span className="text-[color:var(--ledger-paper-dim)]">Pending Settlements</span>
              <span className="font-semibold text-[color:var(--clay)]">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--ledger-paper-dim)]">Compliance Score</span>
              <span className="font-semibold text-[color:var(--moss)]">98.5%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <h3 className="display">Quick Actions</h3>
          <div className="panel-sub">Management tasks</div>
          <div className="space-y-2">
            <Link
              href="/approvals"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[color:var(--line-strong)] hover:bg-[rgba(198,154,76,0.08)] transition-colors group"
            >
              <CheckCircle2 className="w-5 h-5 text-[color:var(--brass)] group-hover:scale-105 transition-transform" />
              <span className="text-sm text-[color:var(--ledger-paper)]">Review All Approvals</span>
              <ArrowRight className="w-4 h-4 text-[color:var(--ledger-paper-dim)] ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/it-users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[color:var(--line-strong)] hover:bg-[rgba(198,154,76,0.08)] transition-colors group"
            >
              <Users className="w-5 h-5 text-blue-400 group-hover:scale-105 transition-transform" />
              <span className="text-sm text-[color:var(--ledger-paper)]">Manage IT Users</span>
              <ArrowRight className="w-4 h-4 text-[color:var(--ledger-paper-dim)] ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/reports/system"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[color:var(--line-strong)] hover:bg-[rgba(198,154,76,0.08)] transition-colors group"
            >
              <Activity className="w-5 h-5 text-purple-400 group-hover:scale-105 transition-transform" />
              <span className="text-sm text-[color:var(--ledger-paper)]">View Reports</span>
              <ArrowRight className="w-4 h-4 text-[color:var(--ledger-paper-dim)] ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="panel">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="display">Recent Activity</h3>
            <div className="panel-sub">Live feed of management actions</div>
          </div>
          <Activity className="w-4 h-4 text-[color:var(--ledger-paper-dim)]" />
        </div>
        <div className="space-y-2 mt-2">
          {recentActivities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(15,23,40,0.4)] border border-[color:var(--line)] hover:border-[color:var(--line-strong)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.status === "success" ? "bg-[color:var(--moss)]" : "bg-[color:var(--clay)]"
                  }`}
                />
                <span className="text-sm text-[color:var(--ledger-paper)]">{item.event}</span>
              </div>
              <span className="text-xs text-[color:var(--ledger-paper-dim)]">{item.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-[color:var(--line)]">
          <Link
            href="/reports/system"
            className="text-xs font-mono text-[color:var(--brass)] hover:underline flex items-center gap-1"
          >
            View full activity log →
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import {
  Server,
  Users,
  AlertTriangle,
  RefreshCw,
  Key,
  Cpu,
  Network,
  Database,
  FileText,
  CheckCircle2,
  XCircle,
  HardDrive,
  Activity,
  Fingerprint,
  Scan,
  PenTool,
} from "lucide-react";

export default function ITDashboard() {
  // Updated device list – no facial recognition
  const devices = [
    { name: "Fingerprint Scanners", total: 48, online: 48, status: "Operational" },
    { name: "IR Iris Scanners", total: 16, online: 16, status: "Operational" },
    { name: "Signature Pads", total: 24, online: 22, status: "Warning" },
  ];

  // Mock activity data
  const activities = [
    { time: "10:42:15 UTC", event: "Patch Deployed", detail: "Biometric algorithm v4.2 pushed to 48 scanners", status: "Success" },
    { time: "10:38:02 UTC", event: "Credential Reset", detail: "Password reset for IT user: B. Amare", status: "Success" },
    { time: "10:15:44 UTC", event: "Device Offline", detail: "Signature pad BR-105 went offline", status: "Warning" },
    { time: "09:55:10 UTC", event: "Firmware Update", detail: "IR scanner firmware upgraded to v3.1.2", status: "Success" },
  ];

  const quickActions = [
    { icon: Key, label: "Reset User Credentials" },
    { icon: Cpu, label: "Deploy Firmware Patch" },
    { icon: Network, label: "Run Network Diagnostic" },
    { icon: Database, label: "Trigger System Backup" },
    { icon: FileText, label: "View Audit Trail" },
  ];

  const getDeviceIcon = (name: string) => {
    if (name.includes("Fingerprint")) return Fingerprint;
    if (name.includes("Iris")) return Scan;
    if (name.includes("Signature")) return PenTool;
    return Server;
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Devices Online
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">247</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">100% uptime</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Active Sessions
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">1,892</p>
            <p className="text-[10px] text-[color:var(--moss)] font-medium">↑ 8% today</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Open Incidents
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">12</p>
            <p className="text-[10px] text-[color:var(--clay)] font-medium">4 critical</p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              System Updates
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">3</p>
            <p className="text-[10px] text-amber-400 font-medium">Pending deployment</p>
          </div>
        </div>
      </div>

      {/* Biometric Device Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Health */}
        <div className="panel">
          <h3 className="display">Biometric Device Health</h3>
          <div className="panel-sub">Live monitoring</div>
          <div className="space-y-4">
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.name);
              return (
                <div
                  key={device.name}
                  className="flex items-center justify-between py-2 border-b border-[color:var(--line)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[color:var(--brass)]" />
                    <div
                      className={`w-2 h-2 rounded-full ${
                        device.online === device.total
                          ? "bg-[color:var(--moss)]"
                          : device.online > device.total * 0.8
                          ? "bg-amber-500"
                          : "bg-[color:var(--clay)]"
                      }`}
                    />
                    <span className="text-sm text-[color:var(--ledger-paper)]">{device.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">
                      {device.online}/{device.total}
                    </span>
                    <span
                      className={`status-chip ${
                        device.status === "Operational"
                          ? "pass"
                          : device.status === "Degraded"
                          ? "info"
                          : "fail"
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <h3 className="display">Quick Actions</h3>
          <div className="panel-sub">System tasks</div>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[color:var(--line-strong)] hover:bg-[rgba(198,154,76,0.08)] transition-colors group"
                >
                  <Icon className="w-5 h-5 text-[color:var(--brass)] group-hover:scale-105 transition-transform" />
                  <span className="text-sm text-[color:var(--ledger-paper)]">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Recent System Activity</h3>
          <Link
            href="/reports/system"
            className="font-mono text-xs text-[color:var(--brass)] hover:underline flex items-center gap-1"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>Details</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item, i) => (
                <tr key={i}>
                  <td className="mono-cell">{item.time}</td>
                  <td className="font-medium">{item.event}</td>
                  <td className="text-[color:var(--ledger-paper-dim)]">{item.detail}</td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`status-chip ${
                        item.status === "Success" ? "pass" : "info"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Building2,
  Users,
  DollarSign,
  Fingerprint,
  Plus,
  Key,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function PermissionManagementPage() {
  const { toasts, toast, dismissToast } = useToast();

  const permissions = [
    { code: "BRANCH_CREATE", category: "BRANCH", desc: "Ability to provision new bank branches.", icon: Building2 },
    { code: "BRANCH_EDIT", category: "BRANCH", desc: "Ability to modify branch details and settings.", icon: Building2 },
    { code: "STAFF_APPOINT", category: "STAFF", desc: "Ability to appoint branch managers and accountants.", icon: Users },
    { code: "STAFF_TERMINATE", category: "STAFF", desc: "Ability to deactivate or terminate staff accounts.", icon: Users },
    { code: "TX_OVERRIDE", category: "TRANSACTION", desc: "Ability to approve high-value cash withdrawals.", icon: DollarSign },
    { code: "TX_VOID", category: "TRANSACTION", desc: "Ability to void completed transactions.", icon: DollarSign },
    { code: "BIOMETRIC_ENROLL", category: "BIOMETRIC", desc: "Ability to capture and enroll new customer fingerprints.", icon: Fingerprint },
    { code: "BIOMETRIC_VERIFY", category: "BIOMETRIC", desc: "Ability to verify customer identity using biometrics.", icon: Fingerprint },
  ];

  // Permission mapping for each role
  const rolePermissions = {
    SUPER_ADMIN: permissions.map(p => "FULL"),
    SUPER_ADMIN_MANAGER: permissions.map(p =>
      ["STAFF_APPOINT", "TX_OVERRIDE"].includes(p.code) ? "FULL" :
      ["BRANCH_CREATE", "BRANCH_EDIT", "STAFF_TERMINATE"].includes(p.code) ? "PARTIAL" :
      "NONE"
    ),
    BANK_MANAGER: permissions.map(p =>
      ["STAFF_APPOINT", "TX_OVERRIDE", "BIOMETRIC_VERIFY"].includes(p.code) ? "FULL" :
      ["TX_VOID"].includes(p.code) ? "PARTIAL" :
      "NONE"
    ),
    ACCOUNTANT: permissions.map(p =>
      ["BIOMETRIC_VERIFY", "TX_OVERRIDE"].includes(p.code) ? "FULL" :
      "NONE"
    ),
  };

  const getStatusBadge = (status: string) => {
    if (status === "FULL") {
      return <CheckCircle2 className="w-4 h-4 text-[color:var(--moss)]" />;
    } else if (status === "PARTIAL") {
      return <MinusCircle className="w-4 h-4 text-amber-400" />;
    } else {
      return <XCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "FULL") return "Full Access";
    if (status === "PARTIAL") return "Limited";
    return "None";
  };

  const getStatusClass = (status: string) => {
    if (status === "FULL") return "text-[color:var(--moss)]";
    if (status === "PARTIAL") return "text-amber-400";
    return "text-slate-600";
  };

  // Get unique categories
  const categories = [...new Set(permissions.map(p => p.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Permission Management</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Configure granular system capability tokens mapped to user roles.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20">
          <Plus className="w-4 h-4" />
          <span>Add Permission</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Permissions
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {permissions.length}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Full Access
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">
              {permissions.filter((_, i) => rolePermissions.SUPER_ADMIN[i] === "FULL").length}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldQuestion className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Limited Access
            </p>
            <p className="text-xl font-bold text-amber-400">
              {permissions.filter((_, i) => rolePermissions.SUPER_ADMIN[i] === "PARTIAL").length}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              No Access
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">
              {permissions.filter((_, i) => rolePermissions.SUPER_ADMIN[i] === "NONE").length}
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Permission Matrix</h3>
          <span className="mono text-xs text-[color:var(--ledger-paper-dim)]">
            {permissions.length} permissions · {Object.keys(rolePermissions).length} roles
          </span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Permission</th>
                <th>Category</th>
                <th>Description</th>
                <th className="text-center">Super Admin</th>
                <th className="text-center">Super Admin Manager</th>
                <th className="text-center">Bank Manager</th>
                <th className="text-center">Accountant</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => {
                const Icon = permission.icon;
                return (
                  <tr key={permission.code}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[color:var(--brass)]" />
                        <span className="mono-cell font-semibold text-[color:var(--brass)]">
                          {permission.code}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-purple-400 text-xs">{permission.category}</span>
                    </td>
                    <td className="text-[color:var(--ledger-paper-dim)]">{permission.desc}</td>
                    {Object.keys(rolePermissions).map((role) => {
                      const status = rolePermissions[role as keyof typeof rolePermissions][index];
                      return (
                        <td key={role} className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            {getStatusBadge(status)}
                            <span className={`text-[9px] ${getStatusClass(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Plus,
  Pencil,
  Trash2,
  Users,
  Key,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function RoleManagementPage() {
  const { toasts, toast, dismissToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ code: string; name: string } | null>(null);

  const roles = [
    { code: "SUPER_ADMIN", name: "Super Administrator", description: "Global institution system access, branch creation, role assignment.", count: 4, permissions: 24 },
    { code: "SUPER_ADMIN_MANAGER", name: "Super Admin Manager", description: "Operations oversight, approval management, IT and FOREX supervision.", count: 2, permissions: 18 },
    { code: "SUPER_ADMIN_IT", name: "Super Admin IT", description: "Infrastructure management, device health monitoring, system configuration.", count: 3, permissions: 16 },
    { code: "SUPER_ADMIN_FOREX", name: "Super Admin FOREX", description: "Currency exchange oversight, transaction approval, dealer management.", count: 2, permissions: 14 },
    { code: "BANK_MANAGER", name: "Bank Manager", description: "Branch supervisor, high-value transaction override, teller roster management.", count: 48, permissions: 12 },
    { code: "BRANCH_IT", name: "Branch IT", description: "Local infrastructure support, device maintenance, biometric terminal health.", count: 8, permissions: 8 },
    { code: "IT_SUPPORT", name: "IT Support", description: "Technical IT operations, branch provisioning and system setup.", count: 0, permissions: 6 },
    { code: "ACCOUNTANT", name: "Accountant / Teller", description: "Counter cashier, cash withdrawal execution, customer biometric scanning.", count: 312, permissions: 6 },
    { code: "AUDITOR", name: "System Compliance Auditor", description: "Read-only security log access, audit trail inspection, report export.", count: 12, permissions: 4 },
  ];

  const totalRoles = roles.length;
  const totalAssigned = roles.reduce((sum, r) => sum + r.count, 0);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    toast.success("Role Removed", `${deleteTarget.name} has been removed.`);
    setDeleteTarget(null);
  };

  // Role icon mapping
  const getRoleIcon = (code: string) => {
    if (code.includes("SUPER")) return ShieldCheck;
    if (code.includes("MANAGER")) return Shield;
    if (code.includes("IT")) return ShieldQuestion;
    return ShieldAlert;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">System Role Governance</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Define institutional user roles and authorization scopes.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20">
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Roles
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {totalRoles}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Assigned Users
            </p>
            <p className="text-xl font-bold text-[color:var(--moss)]">
              {totalAssigned.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Permissions
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {roles.reduce((sum, r) => sum + r.permissions, 0)}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              System Roles
            </p>
            <p className="text-xl font-bold text-amber-400">
              {roles.filter(r => r.code.includes("SUPER")).length}
            </p>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = getRoleIcon(role.code);
          return (
            <div
              key={role.code}
              className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-[color:var(--brass)]/40 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{role.name}</h3>
                    <p className="text-[10px] font-mono text-[color:var(--brass)]">{role.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {role.count} Users
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[color:var(--brass)]/10 text-[color:var(--brass)]">
                    {role.permissions} Permissions
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{role.description}</p>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[color:var(--line)]">
                <Link
                  href={`/governance/roles/edit?id=${role.code}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-[10px] font-semibold transition-colors border border-[color:var(--brass)]/30"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold transition-colors border border-rose-500/30"
                  onClick={() => setDeleteTarget({ code: role.code, name: role.name })}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Role"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This will also remove the role from all assigned users.`}
        confirmLabel="Remove Role"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Building2,
  Calendar,
  Activity,
  Pencil,
  KeyRound,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useState } from "react";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function ITUserDetailsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { getITUserById, resetITUserPassword } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);

  const user = userId ? getITUserById(userId) : null;

  const handleResetPasswordConfirm = () => {
    if (!resetTarget) return;
    resetITUserPassword(resetTarget.id);
    toast.success("Password Reset", `Security credentials reset for ${resetTarget.name}.`);
    setResetTarget(null);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/it-users"
            className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white">IT User Not Found</h1>
        </div>
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <User className="w-12 h-12 text-[color:var(--ledger-paper-dim)]/30 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">The requested IT user record could not be located.</p>
          <Link
            href="/it-users"
            className="inline-flex items-center gap-2 mt-4 text-[color:var(--brass)] hover:underline text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to IT User Directory
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Calculate some mock stats
  const stats = {
    totalApprovals: 142,
    successRate: "99.8%",
    activeSessions: 3,
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/it-users"
              className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">IT User Profile</h1>
              <p className="text-xs text-[color:var(--ledger-paper-dim)]">
                System access credentials and activity log for {user.fullName}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            <button
              onClick={() => setResetTarget({ id: user.id, name: user.fullName })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors border border-amber-500/30"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Reset Password
            </button>
            <Link
              href={`/it-users/edit?id=${user.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-bold text-2xl flex items-center justify-center border border-[color:var(--brass)]/30">
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <p className="text-xs text-slate-400 font-mono">
                ID: {user.employeeId} · Provisioned: {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-[#0B192C] border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Total Approvals</p>
              <p className="text-lg font-bold text-[color:var(--ledger-paper)]">{stats.totalApprovals}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B192C] border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Success Rate</p>
              <p className="text-lg font-bold text-[color:var(--moss)]">{stats.successRate}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B192C] border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Active Sessions</p>
              <p className="text-lg font-bold text-[color:var(--brass)]">{stats.activeSessions}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold text-[10px] mb-1">
                <Mail className="w-3 h-3" /> Institutional Email
              </div>
              <p className="text-slate-200 font-medium">{user.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold text-[10px] mb-1">
                <Phone className="w-3 h-3" /> Contact Phone
              </div>
              <p className="text-slate-200 font-medium">{user.phone}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold text-[10px] mb-1">
                <Building2 className="w-3 h-3" /> Department
              </div>
              <p className="text-slate-200 font-medium">{user.department}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold text-[10px] mb-1">
                <Clock className="w-3 h-3" /> Last Login
              </div>
              <p className="text-slate-200 font-medium">
                {user.lastLogin ? formatDateTime(user.lastLogin) : "Never logged in"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold text-[10px] mb-1">
                <Calendar className="w-3 h-3" /> Account Created
              </div>
              <p className="text-slate-200 font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold text-[10px] mb-1">
                <Shield className="w-3 h-3" /> Access Level
              </div>
              <p className="text-emerald-400 font-bold font-mono">SYSTEM ADMINISTRATOR</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[color:var(--brass)]" />
            Recent System Activity
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B192C] border border-slate-800">
              <div>
                <p className="text-slate-200 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--moss)]" />
                  Logged into Dashboard
                </p>
                <p className="text-slate-500 text-[11px]">IP: 192.168.1.42 · Session ID: ses_xyz123</p>
              </div>
              <span className="text-slate-400 text-[11px]">
                {user.lastLogin ? formatDateTime(user.lastLogin) : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B192C] border border-slate-800">
              <div>
                <p className="text-slate-200 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--moss)]" />
                  Account Provisioned
                </p>
                <p className="text-slate-500 text-[11px]">Created by Super Administrator</p>
              </div>
              <span className="text-slate-400 text-[11px]">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!resetTarget}
        title="Reset Password"
        message={`Reset security credentials for "${resetTarget?.name}"? They will receive a temporary password via institutional email.`}
        confirmLabel="Reset Password"
        variant="warning"
        onConfirm={handleResetPasswordConfirm}
        onCancel={() => setResetTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default function ITUserDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">Loading IT user details...</p>
        </div>
      }
    >
      <ITUserDetailsContent />
    </Suspense>
  );
}
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, MapPin, Phone, Mail, ShieldCheck, Building2, Users, AlertTriangle } from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

function BranchDetailsContent() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("id");
  const { getBranchById } = useSuperAdminStore();
  const branch = branchId ? getBranchById(branchId) : null;

  if (!branch) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <Building2 className="w-12 h-12 text-[color:var(--ledger-paper-dim)]/30 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Branch not found.</p>
          <Link
            href="/branches"
            className="inline-flex items-center gap-2 mt-4 text-[color:var(--brass)] hover:underline text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Branch Directory
          </Link>
        </div>
      </div>
    );
  }

  const statusColor =
    branch.status === "ACTIVE"
      ? "text-[color:var(--moss)] bg-[color:var(--moss)]/10 border-[color:var(--moss)]/30"
      : branch.status === "MAINTENANCE"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-[color:var(--clay)] bg-[color:var(--clay)]/10 border-[color:var(--clay)]/30";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/branches"
            className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">{branch.name}</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)]">
              ID: {branch.code} · Created: {formatDate(branch.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
            {branch.status}
          </span>
          <Link
            href={`/branches/edit?id=${branch.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors border border-rose-500/30">
            <Trash2 className="w-3.5 h-3.5" />
            Deactivate
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Assigned Manager
            </div>
            <p className="text-slate-200 font-semibold mt-1">{branch.managerName || "Unassigned"}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Biometric Success Rate
            </div>
            <p className="text-[color:var(--moss)] font-bold font-mono mt-1">99.8%</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              Anomalies Detected
            </div>
            <p className="text-[color:var(--clay)] font-bold font-mono mt-1">12</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              Daily Limit
            </div>
            <p className="text-[color:var(--brass)] font-bold font-mono mt-1">
              ${branch.dailyTransactionLimit?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-white mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-[color:var(--brass)]" />
              <span>{branch.address}, {branch.city}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-4 h-4 text-[color:var(--brass)]" />
              <span>{branch.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-[color:var(--brass)]" />
              <span>{branch.email}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-white mb-3">Recent Activity</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-[#0B192C] border border-slate-800">
              <span className="text-slate-300">Vault Access Request</span>
              <span className="text-[color:var(--moss)] font-semibold">Authorized</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#0B192C] border border-slate-800">
              <span className="text-slate-300">Biometric Override</span>
              <span className="text-[color:var(--clay)] font-semibold">Flagged</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#0B192C] border border-slate-800">
              <span className="text-slate-300">Accountant Onboarding</span>
              <span className="text-[color:var(--moss)] font-semibold">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BranchDetailsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto glass-panel p-12 rounded-2xl border border-slate-800 text-center">
        <p className="text-slate-400 text-sm">Loading branch details...</p>
      </div>
    }>
      <BranchDetailsContent />
    </Suspense>
  );
}
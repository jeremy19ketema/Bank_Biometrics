"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { bankApi } from "@/services/bankApi";

type StaffDetail = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  branchId: string | null;
  branchName: string;
  status: string;
  isActive: boolean;
  isFirstLogin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

function statusChipClass(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "status-chip pass";
    case "PENDING_FIRST_LOGIN":
    case "PENDING_APPROVAL":
      return "status-chip info";
    default:
      return "status-chip fail";
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function DetailsContent() {
  const searchParams = useSearchParams();
  const staffId = searchParams.get("id");

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStaff = useCallback(async () => {
    if (!staffId) {
      setError("No accountant selected.");
      setLoading(false);
      return;
    }

    const result = await bankApi.staffDetails(staffId);
    if (result.success && result.data) {
      setStaff(result.data as StaffDetail);
    } else {
      setError(result.message || "Failed to load accountant details.");
    }
    setLoading(false);
  }, [staffId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading operator profile…
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-400">{error || "Accountant not found."}</p>
          <Link href="/accountants" className="btn-mini inline-block">← Return to roster</Link>
        </div>
      </div>
    );
  }

  const initials = staff.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Teller Operator Inspection</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Detailed account profile for {staff.fullName}.</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xl">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{staff.fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">
              ID: EMP-{staff.username.toUpperCase()} | Branch: {staff.branchName}
            </p>
          </div>
          <span className={statusChipClass(staff.status)}>{staff.status.replace(/_/g, " ")}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Username</span>
            <p className="text-[color:var(--brass)] font-bold font-mono text-sm">@{staff.username}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Email</span>
            <p className="text-slate-200 font-medium break-all">{staff.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">System Role</span>
            <p className="font-bold font-mono text-sm text-purple-400">{staff.role.replace(/_/g, " ")}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Account Active</span>
            <p className={`font-bold font-mono text-sm ${staff.isActive ? "text-emerald-400" : "text-red-400"}`}>
              {staff.isActive ? "YES" : "NO"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Last Login</span>
            <p className="text-slate-200 font-medium">{formatDate(staff.lastLoginAt)}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Registered On</span>
            <p className="text-slate-200 font-medium">{formatDate(staff.createdAt)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Link href={`/accountants/edit?id=${staff.id}`} className="btn-mini">Edit Credentials</Link>
          <Link href={`/accountants/performance?id=${staff.id}`} className="btn-mini">View Performance</Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountantDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading…</div>}>
      <DetailsContent />
    </Suspense>
  );
}

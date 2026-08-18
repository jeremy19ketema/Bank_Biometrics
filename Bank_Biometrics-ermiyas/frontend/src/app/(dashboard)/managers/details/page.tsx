"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSuperAdminStore } from "@/store/superAdminStore";

function ManagerDetailsContent() {
  const searchParams = useSearchParams();
  const managerId = searchParams.get("id");
  const { getManagerById } = useSuperAdminStore();
  const manager = managerId ? getManagerById(managerId) : null;

  if (!manager) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">Manager not found.</p>
          <Link href="/managers" className="text-[color:var(--brass)] hover:underline text-xs mt-2">← Return to Bank Managers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/managers" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Manager Details</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Profile for {manager.fullName}.</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-bold text-2xl flex items-center justify-center">
            {manager.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{manager.fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">ID: {manager.employeeId} | Branch: {manager.branchName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Email</span>
            <p className="text-slate-200 font-medium">{manager.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Phone</span>
            <p className="text-slate-200 font-medium">{manager.phone}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Status</span>
            <p className={`font-bold ${manager.status === "ACTIVE" ? "text-[color:var(--moss)]" : "text-[color:var(--clay)]"}`}>{manager.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDetailsPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
      <ManagerDetailsContent />
    </Suspense>
  );
}
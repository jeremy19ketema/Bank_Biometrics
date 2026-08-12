"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditAccountantPage() {
  const [formData, setFormData] = useState({
    empId: "ACT-401",
    fullName: "Bethlehem Haile",
    tillNumber: "Till #01"
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Modify Accountant Credentials</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Update operator status or till assignment for ACT-401.</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Teller ID</label>
            <input type="text" readOnly value={formData.empId} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-[color:var(--brass)] font-mono font-bold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href="/accountants" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</Link>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] font-bold text-xs shadow-lg shadow-[color:var(--brass)]/20">
            <Save className="w-4 h-4" />
            <span>Update Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
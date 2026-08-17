"use client";

import React from "react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export default function LeaveOvertimePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Human Resources</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Leave & Overtime Requests
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition">
              Request Overtime
            </button>
            <button className="bg-[color:var(--brass)] text-[#16233A] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#d7ab5c] transition shadow-lg">
              Request Leave
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <h3 className="display flex items-center gap-2"><Calendar className="w-5 h-5 text-[color:var(--moss)]" /> Pending Leave</h3>
          <div className="text-center py-12 text-slate-500 italic text-sm">
             No pending leave requests requiring your approval.
          </div>
        </div>

        <div className="panel">
          <h3 className="display flex items-center gap-2"><Clock className="w-5 h-5 text-[color:var(--brass)]" /> Pending Overtime</h3>
          <div className="text-center py-12 text-slate-500 italic text-sm">
             No pending overtime requests requiring your approval.
          </div>
        </div>
      </div>
    </div>
  );
}

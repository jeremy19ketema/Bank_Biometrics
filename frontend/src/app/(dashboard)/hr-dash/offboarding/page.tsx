"use client";

import React from "react";
import { UserMinus, Laptop, FileX, Key, CheckCircle2, CircleDashed } from "lucide-react";

const mockOffboarding = [
  { id: 1, name: "Michael Osei", role: "Senior Accountant", branch: "Bole Branch", endDate: "2026-08-30", progress: 40, tasks: { hardware: "pending", access: "done", interview: "pending" } },
  { id: 2, name: "Sara Getachew", role: "Teller", branch: "Canary Wharf Branch", endDate: "2026-08-22", progress: 100, tasks: { hardware: "done", access: "done", interview: "done" } },
];

export default function OffboardingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Offboarding</h1>
        <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">Manage the transition process for departing employees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockOffboarding.map((emp) => (
          <div key={emp.id} className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 transition-all hover:bg-[rgba(20,28,48,0.8)] hover:border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)]">{emp.name}</h3>
                <p className="text-sm text-[color:var(--brass)] mt-1">{emp.role}</p>
                <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Last Day: {emp.endDate} • {emp.branch}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)]">
                <UserMinus className="h-5 w-5 text-red-500" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-[color:var(--ledger-paper-dim)] mb-2">
                <span>Progress</span>
                <span>{emp.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${emp.progress === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${emp.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[color:var(--ledger-paper-dim)]">
                  <Laptop className="h-4 w-4" />
                  <span>Hardware Return</span>
                </div>
                {emp.tasks.hardware === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4 text-gray-500" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[color:var(--ledger-paper-dim)]">
                  <Key className="h-4 w-4" />
                  <span>Access Revocation</span>
                </div>
                {emp.tasks.access === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4 text-gray-500" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[color:var(--ledger-paper-dim)]">
                  <FileX className="h-4 w-4" />
                  <span>Exit Interview</span>
                </div>
                {emp.tasks.interview === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

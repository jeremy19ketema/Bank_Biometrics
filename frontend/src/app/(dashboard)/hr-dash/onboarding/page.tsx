"use client";

import React from "react";
import { UserPlus, FileCheck, Laptop, CheckCircle2, CircleDashed } from "lucide-react";

const mockOnboarding = [
  { id: 1, name: "Samuel Tadesse", role: "Junior Developer", branch: "HQ - Addis Ababa", startDate: "2026-08-25", progress: 65, tasks: { docs: "done", it: "pending", orientation: "pending" } },
  { id: 2, name: "Helen Berhane", role: "Customer Service", branch: "Bole Branch", startDate: "2026-08-20", progress: 100, tasks: { docs: "done", it: "done", orientation: "done" } },
  { id: 3, name: "Ahmed Nur", role: "Security Analyst", branch: "HQ - Addis Ababa", startDate: "2026-08-28", progress: 20, tasks: { docs: "pending", it: "pending", orientation: "pending" } },
];

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Onboarding</h1>
        <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">Track and manage the onboarding progress for new hires.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockOnboarding.map((hire) => (
          <div key={hire.id} className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 transition-all hover:bg-[rgba(20,28,48,0.8)] hover:border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)]">{hire.name}</h3>
                <p className="text-sm text-[color:var(--brass)] mt-1">{hire.role}</p>
                <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Starts: {hire.startDate} • {hire.branch}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(198,154,76,0.1)]">
                <UserPlus className="h-5 w-5 text-[color:var(--brass)]" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-[color:var(--ledger-paper-dim)] mb-2">
                <span>Progress</span>
                <span>{hire.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${hire.progress === 100 ? 'bg-green-500' : 'bg-[color:var(--brass)]'}`}
                  style={{ width: `${hire.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[color:var(--ledger-paper-dim)]">
                  <FileCheck className="h-4 w-4" />
                  <span>Document Verification</span>
                </div>
                {hire.tasks.docs === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4 text-gray-500" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[color:var(--ledger-paper-dim)]">
                  <Laptop className="h-4 w-4" />
                  <span>IT Setup & Credentials</span>
                </div>
                {hire.tasks.it === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4 text-gray-500" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[color:var(--ledger-paper-dim)]">
                  <UserPlus className="h-4 w-4" />
                  <span>Orientation</span>
                </div>
                {hire.tasks.orientation === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

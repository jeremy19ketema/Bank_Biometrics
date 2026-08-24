"use client";

import React from "react";
import { GraduationCap, Award, AlertTriangle, PlayCircle } from "lucide-react";

const mockTraining = [
  { id: 1, title: "Anti-Money Laundering (AML) 2026", category: "Compliance", enrolled: 145, completed: 120, deadline: "2026-09-30", required: true },
  { id: 2, title: "Data Privacy & GDPR Basics", category: "Security", enrolled: 210, completed: 205, deadline: "2026-08-31", required: true },
  { id: 3, title: "Customer De-escalation Techniques", category: "Soft Skills", enrolled: 45, completed: 12, deadline: "-", required: false },
  { id: 4, title: "Biometric System Operation v2.4", category: "Technical", enrolled: 89, completed: 89, deadline: "2026-07-15", required: true },
];

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Training & Compliance</h1>
        <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">Monitor mandatory employee training progress and organizational compliance rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <Award className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">94%</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Overall Compliance Rate</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <GraduationCap className="h-8 w-8 text-[color:var(--brass)] mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">4</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Active Mandatory Courses</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">12</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Staff Needing Reminders</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] overflow-hidden shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-[color:var(--ledger-paper)]">Course Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[color:var(--ledger-paper-dim)] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Course Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Completion</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[color:var(--ledger-paper)]">
              {mockTraining.map((course) => {
                const rate = Math.round((course.completed / course.enrolled) * 100) || 0;
                return (
                  <tr key={course.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        {course.title}
                        {course.required && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 uppercase">Mandatory</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[color:var(--ledger-paper-dim)]">{course.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 90 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }}></div>
                        </div>
                        <span className="text-xs text-[color:var(--ledger-paper-dim)]">{rate}% ({course.completed}/{course.enrolled})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[color:var(--ledger-paper-dim)]">{course.deadline}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[color:var(--brass)] bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 rounded-lg transition-colors">
                        <PlayCircle className="h-4 w-4" />
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

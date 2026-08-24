"use client";

import React from "react";
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";

const mockLeaves = [
  { id: 1, name: "Tigist Kebede", type: "Annual Leave", startDate: "2026-08-26", endDate: "2026-09-05", status: "Pending", days: 10 },
  { id: 2, name: "Solomon Tesfaye", type: "Sick Leave", startDate: "2026-08-25", endDate: "2026-08-26", status: "Approved", days: 2 },
  { id: 3, name: "Elena Rostova", type: "Maternity Leave", startDate: "2026-09-01", endDate: "2026-12-01", status: "Approved", days: 90 },
];

export default function LeavePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Leave Management</h1>
        <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">Review and manage employee leave requests and balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <Clock className="h-8 w-8 text-amber-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">1</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Pending Requests</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">12</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Approved This Month</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <CalendarDays className="h-8 w-8 text-[color:var(--brass)] mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">8%</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Staff Currently on Leave</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] overflow-hidden shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-[color:var(--ledger-paper)]">Recent Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[color:var(--ledger-paper-dim)] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Leave Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[color:var(--ledger-paper)]">
              {mockLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{leave.name}</td>
                  <td className="px-6 py-4 text-[color:var(--ledger-paper-dim)]">{leave.type}</td>
                  <td className="px-6 py-4 text-[color:var(--ledger-paper-dim)]">{leave.startDate} to {leave.endDate} <span className="text-xs ml-1 opacity-50">({leave.days} days)</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border
                      ${leave.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        leave.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {leave.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors">
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 px-2 py-1">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

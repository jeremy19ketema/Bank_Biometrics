"use client";

import React from "react";
import { Clock, CalendarX2, AlertCircle, CheckCircle2 } from "lucide-react";

const mockAttendance = [
  { id: 1, name: "Tigist Kebede", date: "2026-08-24", status: "Late", time: "09:15 AM", type: "Exception" },
  { id: 2, name: "David Chen", date: "2026-08-24", status: "On Time", time: "08:50 AM", type: "Regular" },
  { id: 3, name: "Solomon Tesfaye", date: "2026-08-24", status: "On Time", time: "08:45 AM", type: "Regular" },
  { id: 4, name: "Jane Doe", date: "2026-08-24", status: "Absent", time: "-", type: "Exception" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Attendance & Exceptions</h1>
        <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">Monitor employee daily attendance, late arrivals, and unexcused absences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <Clock className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">94%</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">On-Time Rate</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">12</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Late Arrivals This Week</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 flex flex-col items-center text-center">
          <CalendarX2 className="h-8 w-8 text-red-500 mb-3" />
          <h3 className="text-3xl font-bold text-[color:var(--ledger-paper)]">3</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)]">Unexcused Absences</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] overflow-hidden shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-[color:var(--ledger-paper)]">Today's Exceptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[color:var(--ledger-paper-dim)] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Time In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[color:var(--ledger-paper)]">
              {mockAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{record.name}</td>
                  <td className="px-6 py-4 text-[color:var(--ledger-paper-dim)]">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border
                      ${record.status === 'On Time' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        record.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {record.status === 'On Time' && <CheckCircle2 className="h-3 w-3" />}
                      {record.status === 'Late' && <Clock className="h-3 w-3" />}
                      {record.status === 'Absent' && <CalendarX2 className="h-3 w-3" />}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[color:var(--ledger-paper-dim)]">{record.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

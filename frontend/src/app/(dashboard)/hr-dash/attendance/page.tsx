"use client";

import React, { useState, useEffect } from "react";
import { Clock, History, FileWarning, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function AttendancePage() {
  const { toast, toasts, dismissToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [eventsRes, approvalsRes] = await Promise.all([
        apiClient.get<any>("/api/attendance"),
        apiClient.get<any>("/api/hr/approvals") // Ideally corrections might be in their own table, but we use the API
      ]);
      if (eventsRes.data.success) setEvents(eventsRes.data.data);
      // Depending on implementation, corrections might be fetched differently. For this UI, we just show events.
      // If the backend has a GET /api/attendance/corrections we would fetch it here.
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Human Resources</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
              <Clock className="w-6 h-6" /> Attendance & Exceptions
            </h1>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-xl backdrop-blur-xl">
         <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> Recent Clock Events
          </h2>
        {loading ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No attendance events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-[color:var(--ledger-paper-dim)] border-b border-white/10">
                <tr>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium text-white">{evt.user?.fullName || evt.userId}</td>
                    <td className="py-4">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          evt.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {evt.type}
                        </span>
                    </td>
                    <td className="py-4 text-slate-300">{new Date(evt.deviceTimestamp).toLocaleString()}</td>
                    <td className="py-4 text-slate-400 text-xs">{evt.deviceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

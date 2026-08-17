"use client";

import React, { useState, useEffect } from "react";
import { Clock, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

interface AttendanceEvent {
  id: string;
  userId: string;
  user: { fullName: string; username: string };
  deviceId: string;
  device: { name: string; macAddress: string };
  type: "IN" | "OUT";
  deviceTimestamp: string;
  source: string;
  adjustments: any[];
}

export default function AttendancePage() {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toast, toasts, dismissToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("aegis_auth_token="))
        ?.split("=")[1];

      const res = await fetch("http://localhost:5000/api/attendance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        toast.error("Error", data.message);
      }
    } catch (error) {
      toast.error("Error", "Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("aegis_auth_token="))
        ?.split("=")[1];

      const start = new Date();
      start.setDate(1); // Start of month
      const end = new Date(); // Today
      
      const res = await fetch(`http://localhost:5000/api/payroll/report/csv?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll_export_${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Success", "Payroll report exported.");
    } catch (error) {
      toast.error("Export Failed", "Could not generate payroll report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Human Resources</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Daily Attendance & Operations
            </h1>
          </div>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="bg-[color:var(--brass)] text-[#16233A] px-4 py-2.5 rounded-xl font-bold hover:bg-[#d7ab5c] transition-colors shadow-lg flex items-center gap-2"
          >
            {exporting ? <span className="animate-spin w-4 h-4 border-2 border-[#16233A] border-t-transparent rounded-full" /> : <Download className="w-4 h-4" />}
            Export Payroll Report
          </button>
        </div>
      </section>

      <div className="panel">
        <h3 className="display mb-4">Raw Device Logs</h3>
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading logs...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-slate-500 py-8 italic">No attendance events recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[color:var(--ledger-paper-dim)]">
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Event</th>
                  <th className="p-3 font-semibold">Timestamp</th>
                  <th className="p-3 font-semibold">Device</th>
                  <th className="p-3 font-semibold">Source</th>
                  <th className="p-3 font-semibold">Adjustments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors text-sm">
                    <td className="p-3">
                      <div className="font-semibold text-[color:var(--ledger-paper)]">{ev.user.fullName}</div>
                      <div className="text-xs text-[color:var(--ledger-paper-dim)]">@{ev.user.username}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ev.type === 'IN' ? 'bg-[color:var(--moss)]/20 text-[color:var(--moss)]' : 'bg-[color:var(--clay)]/20 text-[color:var(--clay)]'}`}>
                        {ev.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-300">
                      {new Date(ev.deviceTimestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-400">{ev.device.name}</td>
                    <td className="p-3 text-slate-400">{ev.source}</td>
                    <td className="p-3">
                      {ev.adjustments.length > 0 ? (
                        <span className="flex items-center gap-1 text-[color:var(--brass)] text-xs font-semibold">
                           <AlertCircle className="w-3 h-3" /> {ev.adjustments.length} Pending
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

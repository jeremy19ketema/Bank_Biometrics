"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function LeaveOvertimePage() {
  const { toast, toasts, dismissToast } = useToast();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [overtimes, setOvertimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveRes, overRes] = await Promise.all([
        apiClient.get<any>("/api/leave"),
        apiClient.get<any>("/api/leave/overtime")
      ]);
      if (leaveRes.data.success) setLeaves(leaveRes.data.data);
      if (overRes.data.success) setOvertimes(overRes.data.data);
    } catch (err) {
      console.error("Failed to fetch leave/overtime", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeaveAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await apiClient.patch<any>(`/api/leave/${id}/approve`, { status });
      if (res.data.success) {
        toast.success(status, `Leave request ${status.toLowerCase()}.`);
        fetchData();
      } else {
        toast.error("Failed", res.data.message);
      }
    } catch (err: any) {
      toast.error("Error", err.response?.data?.message || err.message);
    }
  };

  const handleOvertimeAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await apiClient.patch<any>(`/api/leave/overtime/${id}/approve`, { status });
      if (res.data.success) {
        toast.success(status, `Overtime request ${status.toLowerCase()}.`);
        fetchData();
      } else {
        toast.error("Failed", res.data.message);
      }
    } catch (err: any) {
      toast.error("Error", err.response?.data?.message || err.message);
    }
  };

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
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-[color:var(--moss)]" /> Pending Leave</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-400 animate-pulse">Loading...</div>
            ) : leaves.filter(l => l.status === "PENDING").length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No pending leave requests.</div>
            ) : (
              leaves.filter(l => l.status === "PENDING").map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{req.user?.fullName}</p>
                    <p className="text-xs text-[color:var(--brass)]">{req.type}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</p>
                    {req.reason && <p className="text-xs text-slate-500 italic mt-1">"{req.reason}"</p>}
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => handleLeaveAction(req.id, "REJECTED")} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">Reject</button>
                    <button onClick={() => handleLeaveAction(req.id, "APPROVED")} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition">Approve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-[color:var(--brass)]" /> Pending Overtime</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-400 animate-pulse">Loading...</div>
            ) : overtimes.filter(o => o.status === "PENDING").length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No pending overtime requests.</div>
            ) : (
              overtimes.filter(o => o.status === "PENDING").map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{req.user?.fullName}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(req.date).toLocaleDateString()} • {req.hoursRequested} Hours</p>
                    {req.reason && <p className="text-xs text-slate-500 italic mt-1">"{req.reason}"</p>}
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => handleOvertimeAction(req.id, "REJECTED")} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">Reject</button>
                    <button onClick={() => handleOvertimeAction(req.id, "APPROVED")} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition">Approve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

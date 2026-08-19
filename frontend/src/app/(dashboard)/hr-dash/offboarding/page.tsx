"use client";

import React, { useState, useEffect } from "react";
import { UserMinus, CheckSquare, Clock } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function OffboardingPage() {
  const { toast, toasts, dismissToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    targetUserId: "",
    reason: "",
    finalWorkingDate: "",
    checklists: {
      accessRemoval: false,
      assetsReturned: false,
      biometricRetention: "DELETE"
    }
  });

  const fetchData = async () => {
    try {
      const [userRes, appRes] = await Promise.all([
        apiClient.get<any>("/api/users?status=ACTIVE"),
        apiClient.get<any>("/api/hr/approvals")
      ]);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (appRes.data.success) {
        setPendingApprovals(appRes.data.data.filter((a: any) => a.requestType === "OFFBOARDING"));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post<any>("/api/hr/offboard", formData);
      if (res.data.success) {
        toast.success("Success", "Offboarding requested. Awaiting Checker approval.");
        setFormData({ targetUserId: "", reason: "", finalWorkingDate: "", checklists: { accessRemoval: false, assetsReturned: false, biometricRetention: "DELETE" } });
        fetchData();
      } else {
        toast.error("Failed", res.data.message);
      }
    } catch (err: any) {
      toast.error("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckerAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await apiClient.patch<any>(`/api/hr/offboard/${id}/approve`, { status, rejectionReason: status === "REJECTED" ? "Rejected by checker" : undefined });
      if (res.data.success) {
        toast.success(status, `Offboarding ${status.toLowerCase()}.`);
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
        <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Human Resources</div>
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <UserMinus className="w-6 h-6" /> Staff Offboarding
        </h1>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Initiate Offboarding (Maker)</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select required value={formData.targetUserId} onChange={e => setFormData({...formData, targetUserId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none appearance-none">
              <option value="">Select Employee to Offboard</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.username})</option>)}
            </select>
            <input required type="date" value={formData.finalWorkingDate} onChange={e => setFormData({...formData, finalWorkingDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
            <textarea required placeholder="Reason for leaving" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none resize-none" />
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-slate-300 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-[color:var(--brass)]"/> Clearance Checklist</p>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
                <input type="checkbox" checked={formData.checklists.accessRemoval} onChange={e => setFormData({...formData, checklists: {...formData.checklists, accessRemoval: e.target.checked}})} className="w-4 h-4 accent-[color:var(--brass)] bg-white/10 border-white/20" />
                System Access Removal Confirmed
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
                <input type="checkbox" checked={formData.checklists.assetsReturned} onChange={e => setFormData({...formData, checklists: {...formData.checklists, assetsReturned: e.target.checked}})} className="w-4 h-4 accent-[color:var(--brass)] bg-white/10 border-white/20" />
                Physical Assets / Devices Returned
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full px-5 py-3 rounded-xl bg-[color:var(--brass)] text-[#16233A] text-sm font-bold hover:bg-[#d7ab5c] flex items-center justify-center gap-2 transition">
              {loading && <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
              Submit Offboarding Request
            </button>
          </form>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Pending Approvals (Checker)
          </h2>
          
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
               <div className="text-center py-12 text-slate-500 text-sm">No offboarding requests await approval.</div>
            ) : (
              pendingApprovals.map(req => {
                const details = JSON.parse(req.details || "{}");
                return (
                <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Target User ID: {req.targetUserId}</p>
                    <p className="text-sm text-slate-300">Reason: {details.reason}</p>
                    <p className="text-xs text-slate-400 mt-1">Final Date: {details.finalWorkingDate}</p>
                    <p className="text-xs text-slate-400">Requested by: {req.requestedByName}</p>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => handleCheckerAction(req.id, "REJECTED")} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">
                      Reject
                    </button>
                    <button onClick={() => handleCheckerAction(req.id, "APPROVED")} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition">
                      Approve & Execute
                    </button>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

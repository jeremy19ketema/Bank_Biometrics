"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Clock, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function OnboardingPage() {
  const { toast, toasts, dismissToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "ACCOUNTANT",
    branchId: "",
    password: "",
  });

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const fetchApprovals = async () => {
    try {
      const res = await apiClient.get<any>("/api/hr/approvals");
      if (res.data.success) {
        // Only show USER_CREATION requests
        setPendingApprovals(res.data.data.filter((a: any) => a.requestType === "USER_CREATION"));
      }
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post<any>("/api/users", formData);
      if (res.data.success) {
        toast.success("Success", "Staff account requested. Awaiting Checker approval.");
        setFormData({ username: "", fullName: "", email: "", role: "ACCOUNTANT", branchId: "", password: "" });
        fetchApprovals();
      } else {
        toast.error("Failed", res.data.message);
      }
    } catch (err: any) {
      toast.error("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, userId: string) => {
    try {
      const res = await apiClient.post<any>(`/api/users/${userId}/approve`, { approvalRequestId: id });
      if (res.data.success) {
        toast.success("Approved", "User has been activated.");
        fetchApprovals();
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
          <UserPlus className="w-6 h-6" /> Staff Onboarding
        </h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maker Form */}
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">1. Request New Account (Maker)</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                <input required type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none appearance-none">
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="BANK_MANAGER">Bank Manager</option>
                  <option value="BRANCH_IT">Branch IT</option>
                  <option value="HR">Human Resources</option>
                </select>
              </div>

              {["BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT", "HR"].includes(formData.role) && (
                <input type="text" placeholder="Branch ID (Optional for HQ)" value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              )}

              <input required type="password" placeholder="Initial Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />

              <button type="submit" disabled={loading} className="w-full px-5 py-3 rounded-xl bg-[color:var(--brass)] text-[#16233A] text-sm font-bold hover:bg-[#d7ab5c] flex items-center justify-center gap-2 transition">
                {loading && <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
                Submit Request
              </button>
          </form>
        </div>

        {/* Checker Queue */}
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> 2. Pending Approvals (Checker)
          </h2>
          
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
               <div className="text-center py-12 text-slate-500 text-sm">No onboarding requests await approval.</div>
            ) : (
              pendingApprovals.map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{JSON.parse(req.details || "{}").reason || req.details}</p>
                    <p className="text-xs text-slate-400 mt-1">Requested by: {req.requestedByName}</p>
                  </div>
                  <button onClick={() => handleApprove(req.id, req.targetUserId)} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition shrink-0">
                    Approve
                  </button>
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

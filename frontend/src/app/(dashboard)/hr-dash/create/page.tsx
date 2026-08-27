"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHRStore } from "@/store/hrStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { UserPlus, ArrowLeft, Briefcase, Shield, KeyRound, Building, Mail, User, Eye, EyeOff } from "lucide-react";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { loading, createStaffRequest } = useHRStore();
  const { toasts, toast, dismissToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "BANK_MANAGER",
    branchId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.email) {
      toast.error("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const res = await createStaffRequest(formData);
    if (res.success) {
      if (res.data?.temporaryPasscode) {
        window.prompt(
          `${formData.role.replace(/_/g, " ")} created and sent for Super Admin approval.\n\nIMPORTANT: Copy this temporary passcode and share it securely with the user:`,
          res.data.temporaryPasscode
        );
      } else {
        toast.success("Success", `${formData.role.replace(/_/g, " ")} created and sent for Super Admin approval.`);
      }
      router.push("/hr-dash");
    } else {
      toast.error("Error", res.message || "Failed to create staff member. Check console or try again.");
    }
  };

  const showBranchId = ["BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT"].includes(formData.role);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/hr-dash" 
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[color:var(--ledger-paper-dim)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="text-xs uppercase tracking-wider text-[color:var(--brass)] font-semibold">HR Operations</div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
            Add New Employee
          </h1>
          <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
            Initiate the onboarding process. The request will be securely forwarded for final authorization.
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-[color:var(--brass)]/10 border border-[color:var(--brass)]/20 text-[color:var(--brass)]">
          <UserPlus className="w-8 h-8" />
        </div>
      </div>

      {/* Form Container */}
      <form id="create-employee-form" onSubmit={handleSubmit} className="bg-[rgba(15,23,40,0.6)] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[color:var(--brass)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />

        <div className="relative space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all" 
                placeholder="John Doe" 
                type="text" 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all" 
                placeholder="employee@omnibank.com" 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> System Username
              </label>
              <input 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all font-mono" 
                placeholder="johndoe_admin" 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
              />
            </div>



            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Job Role
              </label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all appearance-none cursor-pointer" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="BANK_MANAGER" className="bg-slate-900">Bank Manager</option>
                  <option value="SUPER_ADMIN_IT" className="bg-slate-900">Super Admin IT</option>
                  <option value="SUPER_ADMIN_FOREX" className="bg-slate-900">Super Admin Forex</option>
                  <option value="BRANCH_IT" className="bg-slate-900">Branch IT</option>
                  <option value="ACCOUNTANT" className="bg-slate-900">Accountant</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {showBranchId && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" /> Assigned Branch ID (Optional)
                </label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all font-mono" 
                  placeholder="e.g. BR-001" 
                  type="text" 
                  value={formData.branchId} 
                  onChange={e => setFormData({...formData, branchId: e.target.value})} 
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
            <Link 
              href="/hr-dash" 
              className="px-6 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] text-[#16233A] text-sm font-bold hover:bg-[#d7ab5c] transition-all shadow-[0_0_20px_rgba(198,154,76,0.3)] min-w-[160px]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#16233A]/30 border-t-[#16233A] rounded-full animate-spin" />
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </div>
      </form>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function CreateUserPage() {
  const router = useRouter();
  const { toasts, toast, dismissToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "ACCOUNTANT",
    branchId: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Success", "User created and is PENDING APPROVAL.");
        setTimeout(() => router.push("/super-admin/users"), 1500);
      } else {
        toast.error("Error", data.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error("Error", "Failed to create user");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/super-admin/users" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Create New User</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Account will be PENDING APPROVAL. The maker cannot approve it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username</label>
            <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Initial Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100">
              <option value="ACCOUNTANT">Accountant</option>
              <option value="BANK_MANAGER">Branch Manager</option>
              <option value="HR">HR Officer</option>
              <option value="BRANCH_IT">Branch IT</option>
              <option value="SUPER_ADMIN_MANAGER">Superadmin Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch UUID (Optional)</label>
            <input type="text" placeholder="Enter branch UUID if applicable" value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href="/super-admin/users" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</Link>
          <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] font-bold text-xs shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Create User"}</span>
          </button>
        </div>
      </form>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

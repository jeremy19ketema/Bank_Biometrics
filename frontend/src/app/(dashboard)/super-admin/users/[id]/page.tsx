"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX, UserCheck, Key, Shield, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function UserDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toasts, toast, dismissToast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        toast.error("Error", data.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, isActive: newStatus === "ACTIVE" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Success", `User status updated to ${newStatus}`);
        fetchUser();
      } else {
        toast.error("Error", data.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to update status");
    }
  };

  const handleResetPassword = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Success", "Password reset link has been dispatched.");
      } else {
        toast.error("Error", data.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to reset password");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-slate-400">User not found.</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/super-admin/users" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">{user.fullName}</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)]">Manage account access, roles, and security.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.status === "PENDING_APPROVAL" && (
             <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-1">
               <ShieldAlert className="w-3.5 h-3.5" /> Pending Checker Approval
             </span>
          )}
          {user.status === "ACTIVE" && (
             <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
               <CheckCircle2 className="w-3.5 h-3.5" /> Active
             </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><UserCheck className="w-4 h-4 text-[color:var(--brass)]" /> Identity Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Username</p>
                <p className="text-sm font-mono text-slate-200">{user.username}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="text-sm text-slate-200">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">System Role</p>
                <p className="text-sm text-slate-200">{user.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Branch Scope</p>
                <p className="text-sm text-slate-200">{user.branchId || "Global"}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /> Dynamic Custom Roles</h3>
            {user.customRoles?.length > 0 ? (
              <ul className="space-y-2">
                {user.customRoles.map((cr: any) => (
                  <li key={cr.id} className="p-3 bg-[#0B192C] rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{cr.customRole.name}</p>
                      <p className="text-xs text-slate-400">Scope: {cr.scopeType} - {cr.scopeId}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No custom roles assigned.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 border-t-4 border-t-[color:var(--brass)]">
            <h3 className="text-sm font-bold text-slate-200 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={handleResetPassword} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0B192C] hover:bg-[#111C2E] border border-slate-800 text-left transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Key className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Force Password Reset</p>
                  <p className="text-[10px] text-slate-400">Dispatch secure token link</p>
                </div>
              </button>
              
              {user.status !== "SUSPENDED" ? (
                <button onClick={() => handleStatusChange("SUSPENDED")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0B192C] hover:bg-[#111C2E] border border-slate-800 text-left transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400"><UserX className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Suspend Account</p>
                    <p className="text-[10px] text-slate-400">Immediately revoke access</p>
                  </div>
                </button>
              ) : (
                <button onClick={() => handleStatusChange("ACTIVE")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0B192C] hover:bg-[#111C2E] border border-slate-800 text-left transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><UserCheck className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Reactivate Account</p>
                    <p className="text-[10px] text-slate-400">Restore normal access</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

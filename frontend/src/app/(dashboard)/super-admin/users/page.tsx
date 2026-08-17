"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Shield, Building2, ChevronRight, Activity, Clock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function UsersDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, toast, dismissToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error("Error", data.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">ACTIVE</span>;
      case "PENDING_APPROVAL": return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">PENDING</span>;
      case "PENDING_FIRST_LOGIN": return <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">SETUP REQ</span>;
      case "SUSPENDED": return <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">SUSPENDED</span>;
      default: return <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-bold border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)] flex items-center gap-2">
            <Users className="w-6 h-6 text-[color:var(--brass)]" />
            Staff & User Management
          </h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Manage accountants, branch managers, HR, and IT roles.</p>
        </div>
        <Link href="/super-admin/users/create" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] font-bold text-xs shadow-lg shadow-[color:var(--brass)]/20">
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </Link>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A1424] border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch/Dept</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-[#0F1B2B] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[color:var(--brass)] font-bold text-xs">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{user.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[color:var(--brass)]" />
                        <span className="text-xs text-slate-300 font-semibold">{user.role.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-300">{user.branchName || "Global"}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4 text-right">
                      <Link href={`/super-admin/users/${user.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors">
                        Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

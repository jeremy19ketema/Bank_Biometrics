"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Shield, ChevronRight, UserCog, Plus } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/services/apiClient";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

type CustomRole = {
  id: string;
  name: string;
  description: string;
  _count: { users: number };
};

export default function RolesHub() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, toasts, dismissToast } = useToast();

  const { register: regRole, handleSubmit: handleRole, reset: resetRole } = useForm();
  const { register: regAssign, handleSubmit: handleAssign, reset: resetAssign } = useForm();

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get<any>("/api/roles/custom");
      const data = res.data;
      if (data.success) {
        setRoles(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const onSubmitRole = async (data: any) => {
    try {
      const res = await apiClient.post<any>("/api/roles/custom", data);
      const result = res.data;
      if (result.success) {
        toast.success("Success", "Custom role created successfully!");
        resetRole();
        fetchRoles();
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to create role.");
    }
  };

  const onSubmitAssign = async (data: any) => {
    try {
      const res = await apiClient.post<any>("/api/roles/assign", data);
      const result = res.data;
      if (result.success) {
        toast.success("Success", "Role assigned successfully!");
        resetAssign();
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to assign role.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--brass)] mb-2">
            <Link href="/super-admin" className="hover:underline">Super Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Roles & Permissions Hub</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
            Access Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Define custom business roles and manage scope assignments.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel">
            <h2 className="display mb-4">Core System Roles</h2>
            <div className="text-xs text-slate-500 mb-4">These are hardcoded identity roles that cannot be deleted.</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX", "BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT", "HR"].map(role => (
                <div key={role} className="p-3 border border-white/10 bg-white/5 rounded-xl flex items-center justify-center text-xs font-mono text-slate-300">
                  {role}
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2 className="display mb-4">Dynamic Custom Roles</h2>
            {loading ? (
              <div className="flex justify-center p-8"><span className="animate-spin w-6 h-6 border-2 border-[color:var(--moss)] border-t-transparent rounded-full" /></div>
            ) : (
              <div className="space-y-3">
                {roles.length === 0 && <div className="text-slate-500 text-sm">No custom roles defined.</div>}
                {roles.map(role => (
                  <div key={role.id} className="p-4 border border-[color:var(--moss)]/30 bg-[color:var(--moss)]/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[color:var(--moss)]/20 text-[color:var(--moss)] flex items-center justify-center">
                        <UserCog className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{role.name}</h3>
                        <p className="text-xs text-slate-400">{role.description || "No description provided."}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Assigned Users</div>
                      <div className="font-mono text-white text-lg">{role._count.users}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <h2 className="display mb-4">Create Custom Role</h2>
            <form onSubmit={handleRole(onSubmitRole)} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Role Name</label>
                <input {...regRole("name", { required: true })} placeholder="e.g. Department Auditor" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--moss)] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Description</label>
                <textarea {...regRole("description")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--moss)] focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[color:var(--moss)] text-[#16233A] rounded-xl font-bold text-sm hover:brightness-110">
                Define Role
              </button>
            </form>
          </div>

          <div className="panel">
            <h2 className="display mb-4">Assign Role Scope</h2>
            <form onSubmit={handleAssign(onSubmitAssign)} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">User ID</label>
                <input {...regAssign("userId", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--moss)] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Custom Role</label>
                <select {...regAssign("customRoleId", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--moss)] focus:outline-none">
                  <option value="">Select a role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Scope Level</label>
                <select {...regAssign("scopeType", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--moss)] focus:outline-none">
                  <option value="ORGANIZATION">Organization (Global)</option>
                  <option value="REGION">Region</option>
                  <option value="BRANCH">Branch</option>
                  <option value="DEPARTMENT">Department</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Target Scope ID</label>
                <input {...regAssign("scopeId", { required: true })} placeholder="UUID of the scope entity" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--moss)] focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 border border-[color:var(--moss)] text-[color:var(--moss)] bg-[color:var(--moss)]/10 rounded-xl font-bold text-sm hover:bg-[color:var(--moss)] hover:text-[#16233A] transition-colors">
                Assign Scope
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

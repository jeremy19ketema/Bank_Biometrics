"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { Users, Search, RefreshCw, Mail, Phone, Building2 } from "lucide-react";

export default function EmployeeDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>("/api/users");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Human Resources</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
              <Users className="w-6 h-6" /> Employee Directory
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-[color:var(--brass)] focus:outline-none w-64 transition-all"
              />
            </div>
            <button onClick={fetchUsers} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-xl backdrop-blur-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No employees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-[color:var(--ledger-paper-dim)] border-b border-white/10">
                <tr>
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Branch</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[color:var(--brass)]/20 text-[color:var(--brass)] flex items-center justify-center font-bold">
                          {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-[color:var(--brass)] transition-colors">{user.fullName || user.username}</p>
                          <p className="text-xs text-slate-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">
                      {user.role.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Building2 className="w-3.5 h-3.5" />
                        {user.branchName || "HQ / System"}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        user.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                        user.status === 'INACTIVE' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <a href={`mailto:${user.email}`} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition" title="Email">
                           <Mail className="w-4 h-4" />
                         </a>
                      </div>
                    </td>
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

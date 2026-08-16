"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building2, MapPin, Network, Users, Plus, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "../../../components/ToastContainer";
import { useToast } from "../../../hooks/useToast";

type OrgTree = {
  organizations: any[];
  departments: any[];
};

export default function OrganizationHub() {
  const [treeData, setTreeData] = useState<OrgTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const { toast, toasts, dismissToast } = useToast();

  const [activeForm, setActiveForm] = useState<"ORG" | "REGION" | "BRANCH" | "DEPT">("ORG");

  const { register: regOrg, handleSubmit: handleOrg, reset: resetOrg } = useForm();
  const { register: regRegion, handleSubmit: handleRegion, reset: resetRegion } = useForm();
  const { register: regBranch, handleSubmit: handleBranch, reset: resetBranch } = useForm();
  const { register: regDept, handleSubmit: handleDept, reset: resetDept } = useForm();

  const fetchTree = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/org/tree", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setTreeData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const onSubmitOrg = async (data: any) => {
    try {
      const res = await fetch("http://localhost:5000/api/org/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        toast("success", "Organization created successfully!");
        resetOrg();
        fetchTree();
      } else {
        toast("error", result.message);
      }
    } catch (err) {
      toast("error", "Failed to create organization.");
    }
  };

  const onSubmitRegion = async (data: any) => {
    try {
      const res = await fetch("http://localhost:5000/api/org/regions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        toast("success", "Region created successfully!");
        resetRegion();
        fetchTree();
      } else {
        toast("error", result.message);
      }
    } catch (err) {
      toast("error", "Failed to create region.");
    }
  };

  const onSubmitDept = async (data: any) => {
    try {
      const res = await fetch("http://localhost:5000/api/org/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        toast("success", "Department created successfully!");
        resetDept();
        fetchTree();
      } else {
        toast("error", result.message);
      }
    } catch (err) {
      toast("error", "Failed to create department.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--brass)] mb-2">
            <Link href="/super-admin" className="hover:underline">Super Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Organization Hub</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
            Enterprise Hierarchy
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage global organizations, regions, branches, and departments.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree View */}
        <div className="lg:col-span-2 panel">
          <h2 className="display mb-4">Structure Viewer</h2>
          {loading ? (
            <div className="flex justify-center p-8"><span className="animate-spin w-6 h-6 border-2 border-[color:var(--brass)] border-t-transparent rounded-full" /></div>
          ) : (
            <div className="space-y-2">
              {treeData?.organizations.map(org => (
                <div key={org.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                    onClick={() => toggleNode(org.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedNodes[org.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <Building2 className="w-5 h-5 text-[color:var(--brass)]" />
                      <span className="font-semibold text-white">{org.name}</span>
                      <span className="text-xs font-mono text-slate-500">{org.code}</span>
                    </div>
                  </div>
                  
                  {expandedNodes[org.id] && (
                    <div className="pl-12 pr-4 pb-4 space-y-2 border-t border-white/10 pt-2">
                      {org.regions.length === 0 && <div className="text-xs text-slate-500">No regions configured.</div>}
                      {org.regions.map((region: any) => (
                        <div key={region.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleNode(region.id)}
                          >
                            {expandedNodes[region.id] ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            <MapPin className="w-4 h-4 text-[color:var(--moss)]" />
                            <span className="text-sm text-slate-200">{region.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">{region.code}</span>
                          </div>

                          {expandedNodes[region.id] && (
                            <div className="pl-6 pt-2 space-y-2 mt-2 border-l border-white/10">
                              {region.branches?.length === 0 && <div className="text-xs text-slate-500">No branches in this region.</div>}
                              {region.branches?.map((branch: any) => (
                                <div key={branch.id} className="flex items-center gap-2 text-sm text-slate-300">
                                  <Network className="w-3 h-3 text-[color:var(--clay)]" />
                                  <span>{branch.name}</span>
                                  <span className="text-[10px] font-mono text-slate-500">{branch.code}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Builder Forms */}
        <div className="panel h-fit">
          <h2 className="display mb-4">Entity Builder</h2>
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
            {["ORG", "REGION", "DEPT"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveForm(tab as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  activeForm === tab ? "bg-[color:var(--brass)]/10 text-[color:var(--brass)]" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                + {tab === "ORG" ? "Organization" : tab === "DEPT" ? "Department" : tab === "REGION" ? "Region" : "Branch"}
              </button>
            ))}
          </div>

          {activeForm === "ORG" && (
            <form onSubmit={handleOrg(onSubmitOrg)} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Organization Name</label>
                <input {...regOrg("name", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Org Code (Unique)</label>
                <input {...regOrg("code", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[color:var(--brass)] text-[#16233A] rounded-xl font-bold text-sm hover:brightness-110">
                Create Organization
              </button>
            </form>
          )}

          {activeForm === "REGION" && (
            <form onSubmit={handleRegion(onSubmitRegion)} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Parent Organization</label>
                <select {...regRegion("organizationId", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none">
                  <option value="">Select an Organization...</option>
                  {treeData?.organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Region Name</label>
                <input {...regRegion("name", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Region Code</label>
                <input {...regRegion("code", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[color:var(--brass)] text-[#16233A] rounded-xl font-bold text-sm hover:brightness-110">
                Create Region
              </button>
            </form>
          )}

          {activeForm === "DEPT" && (
            <form onSubmit={handleDept(onSubmitDept)} className="space-y-4">
               <div>
                <label className="text-xs text-slate-400 mb-1 block">Scope Level</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none">
                  <option value="GLOBAL">Global / Unassigned</option>
                  <option value="ORG" disabled>Organization Level (Coming Soon)</option>
                  <option value="BRANCH" disabled>Branch Level (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Department Name</label>
                <input {...regDept("name", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Department Code</label>
                <input {...regDept("code", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[color:var(--brass)] text-[#16233A] rounded-xl font-bold text-sm hover:brightness-110">
                Create Department
              </button>
            </form>
          )}

        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

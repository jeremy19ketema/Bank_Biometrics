"use client";

import React, { useState, useEffect } from "react";
import {
  Users, UserPlus, FileDown, CheckCircle2,
  Clock, ShieldCheck, AlertCircle, Calendar,
  BarChart3, Activity, Briefcase, ChevronRight, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { useHRStore } from "@/store/hrStore";

export default function HRDashboardPage() {
  const { toast, toasts, dismissToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { loading, createStaffRequest } = useHRStore();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "BANK_MANAGER",
    branchId: "",
    passcode: "",
  });

  const [liveData, setLiveData] = useState({
    approvals: [],
    leave: [],
    compliance: [],
  });

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("aegis_auth_token="))
          ?.split("=")[1];

        const [appRes, leaveRes, compRes] = await Promise.all([
          fetch("http://localhost:5000/api/hr/approvals", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/leave", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/compliance/staff", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [appData, leaveData, compData] = await Promise.all([appRes.json(), leaveRes.json(), compRes.json()]);

        setLiveData({
          approvals: appData.success ? appData.data : [],
          leave: leaveData.success ? leaveData.data : [],
          compliance: compData.success ? compData.data : [],
        });
      } catch (err) {
        console.error("Failed to fetch live HR data", err);
      }
    };
    fetchLiveData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.email || !formData.passcode) {
      toast.error("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const success = await createStaffRequest(formData);
    if (success) {
      toast.success("Success", `${formData.role.replace(/_/g, " ")} created and sent for Super Admin approval.`);
      setShowAddModal(false);
      setFormData({
        username: "",
        fullName: "",
        email: "",
        role: "BANK_MANAGER",
        branchId: "",
        passcode: "",
      });
    } else {
      toast.error("Error", "Failed to create staff member. Check console or try again.");
    }
  };

  // Dynamically calculate KPIs
  const pendingApprovalsCount = liveData.approvals.length;
  const pendingLeaveCount = liveData.leave.filter((l: any) => l.status === "PENDING").length;
  const expiredComplianceCount = liveData.compliance.filter((c: any) => c.status === "EXPIRED" || c.status === "FAILED").length;
  
  const offboardingRequests = liveData.approvals.filter((a: any) => a.requestType === "OFFBOARDING").length;

  const kpis = [
    { label: "Total Active Employees", value: "842", delta: "+12 this month", icon: Users },
    { label: "New Hires This Month", value: "18", delta: "On track", icon: UserPlus },
    { label: "Pending Approvals", value: pendingApprovalsCount, delta: `${offboardingRequests} Offboarding`, icon: Clock },
    { label: "Pending Leave Req", value: pendingLeaveCount, delta: "Requires Action", icon: Calendar },
    { label: "Attendance Exceptions", value: "0", delta: "Today", icon: AlertCircle },
    { label: "Compliance Expired", value: expiredComplianceCount, delta: "Needs action", icon: ShieldCheck },
    { label: "Offboarding Overdue", value: offboardingRequests, delta: "Requires Action", icon: Activity },
    { label: "Access Reviews Due", value: "0", delta: "Quarterly review", icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Top Action Bar */}
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">HR Control Center</div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
            Overview & Actions
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brass)] px-4 py-2.5 text-sm font-bold text-[#16233A] shadow-lg transition hover:bg-[#d7ab5c]"
          >
            <UserPlus className="h-4 w-4" /> Add Employee
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)]">
             Start Offboarding
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
            Approve Leave
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
            Attendance Exception
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
            <FileDown className="h-4 w-4" /> Export Report
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-5 shadow-[0_16px_40px_rgba(2,8,23,0.28)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[color:var(--ledger-paper-dim)]">{kpi.label}</span>
                <div className="rounded-xl bg-white/5 p-2 text-[color:var(--brass)]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">{kpi.value}</div>
                <div className="text-xs text-[color:var(--moss)] mb-1">{kpi.delta}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Priority Work Queue & Operational Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Priority Work Queue (takes 2 columns space) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                Priority Work Queue (Live Data)
              </h2>
            </div>
            
            <div className="space-y-3">
              {/* Queue Items */}
              {[
                { title: "Offboarding or generic approvals waiting", count: pendingApprovalsCount, urgent: pendingApprovalsCount > 0 },
                { title: "Leave requests awaiting decision", count: pendingLeaveCount, urgent: pendingLeaveCount > 5 },
                { title: "Expiring or failed compliance courses", count: expiredComplianceCount, urgent: expiredComplianceCount > 0 },
              ].map((item, idx) => (
                <div key={idx} className="group cursor-pointer flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className="text-sm font-medium text-slate-200">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-white">{item.count}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Insights row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[color:var(--brass)]"/> Headcount by Branch</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Main Branch</span><span className="text-white">342</span></div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--brass)] w-[40%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">North Branch</span><span className="text-white">215</span></div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--brass)] opacity-80 w-[25%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">South Branch</span><span className="text-white">180</span></div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--brass)] opacity-60 w-[20%]"></div></div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[color:var(--moss)]"/> Mandatory Training</h3>
              <div className="flex items-center justify-center py-4">
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-white/10">
                  <div className="absolute inset-0 rounded-full border-4 border-[color:var(--moss)] border-l-transparent border-b-transparent transform rotate-45"></div>
                  <span className="text-xl font-bold text-white">{liveData.compliance.length > 0 ? Math.round((liveData.compliance.filter((c:any)=>c.status==="COMPLETED").length / liveData.compliance.length) * 100) : 100}%</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">Overall Completion</p>
            </div>
          </div>
        </div>

        {/* Right Column: Insight Panels */}
        <div className="space-y-6">
          
          <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <Users className="w-4 h-4 text-[color:var(--brass)]" />
              Onboarding Progress
            </h3>
            <div className="space-y-4">
               {/* Just showing counts/status as requested */}
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Documentation Phase</span>
                 <span className="font-semibold text-white">12</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">IT Setup & Provisioning</span>
                 <span className="font-semibold text-white">5</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Orientation Scheduled</span>
                 <span className="font-semibold text-white">8</span>
               </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[color:var(--moss)]" />
              Recent HR Activity
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent hidden-timeline-line">
              {liveData.leave.slice(0,2).map((l:any, idx) => (
                <div key={idx} className="relative flex items-center justify-between gap-4">
                  <div className="w-2 h-2 rounded-full bg-[color:var(--moss)] shrink-0" />
                  <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-xs font-medium text-white">Leave: {l.status}</p>
                    <p className="text-[10px] text-slate-400">{l.user?.fullName}</p>
                  </div>
                </div>
              ))}
              <div className="relative flex items-center justify-between gap-4">
                <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs font-medium text-white">Policy Acknowledgement</p>
                  <p className="text-[10px] text-slate-400">45 employees completed</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Announcements
            </h3>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs font-semibold text-blue-400 mb-1">Upcoming Performance Review</p>
              <p className="text-xs text-slate-300">Q3 performance reviews are due by end of month. Ensure all managers have submitted evaluations.</p>
            </div>
          </section>

        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.95)] p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-2">Add Employee</h3>
              <p className="text-sm text-slate-400 mb-6">Initiate onboarding for a new staff member.</p>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                  <input required type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none appearance-none">
                    <option value="BANK_MANAGER">Bank Manager</option>
                    <option value="SUPER_ADMIN_IT">Super Admin IT</option>
                    <option value="SUPER_ADMIN_FOREX">Super Admin Forex</option>
                    <option value="BRANCH_IT">Branch IT</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>

                {["BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT"].includes(formData.role) && (
                  <input type="text" placeholder="Branch ID (Optional)" value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                )}

                <input required type="password" placeholder="Initial Passcode" value={formData.passcode} onChange={e => setFormData({...formData, passcode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />

                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[color:var(--brass)] text-[#16233A] text-sm font-bold hover:bg-[#d7ab5c] flex items-center gap-2">
                    {loading && <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
                    Submit Request
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

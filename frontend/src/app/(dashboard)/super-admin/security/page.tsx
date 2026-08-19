"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ShieldAlert, Download, Activity, FileText, ChevronRight, CheckCircle, Database } from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<"AUDIT" | "ALERTS" | "POLICIES" | "HEALTH">("AUDIT");
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [health, setHealth] = useState<any>({ backups: [], maintenance: [] });
  const [loading, setLoading] = useState(true);
  const { toast, toasts, dismissToast } = useToast();

  const { register: regPolicy, handleSubmit: handlePolicy } = useForm();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}` };
      
      if (activeTab === "AUDIT") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/audit/logs`, { headers });
        const data = await res.json();
        if (data.success) setLogs(data.data.logs);
      } else if (activeTab === "ALERTS") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/security/alerts`, { headers });
        const data = await res.json();
        if (data.success) setAlerts(data.data);
      } else if (activeTab === "HEALTH") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/security/health`, { headers });
        const data = await res.json();
        if (data.success) setHealth(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/audit/export`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", result.message);
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Export failed");
    }
  };

  const handleActionAlert = async (id: string, action: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/security/alerts/${id}/${action}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", `Alert ${action}ed!`);
        fetchData();
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Action failed");
    }
  };

  const onSubmitPolicy = async (data: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/security/policies/propose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          policyType: data.policyType,
          policyId: data.policyId,
          changes: { [data.field]: data.value }
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", "Approval Request submitted!");
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to submit proposal");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--brass)] mb-2">
            <Link href="/super-admin" className="hover:underline">Super Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Security & Compliance Center</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
            Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Audit logs, alerts, policies, and health monitoring.</p>
        </div>
      </section>

      <div className="flex items-center gap-4 border-b border-white/10 pb-2">
        {["AUDIT", "ALERTS", "POLICIES", "HEALTH"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 text-sm font-semibold transition-colors relative ${
              activeTab === tab ? "text-[color:var(--clay)]" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "AUDIT" ? "Audit Trail" : tab === "ALERTS" ? "Security Alerts" : tab === "POLICIES" ? "Global Policies" : "System Health"}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[color:var(--clay)] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="panel min-h-[500px]">
        {loading ? (
          <div className="flex justify-center p-12"><span className="animate-spin w-8 h-8 border-2 border-[color:var(--clay)] border-t-transparent rounded-full" /></div>
        ) : (
          <>
            {activeTab === "AUDIT" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="display">Immutable Audit Trail</h2>
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[color:var(--brass)]/10 text-[color:var(--brass)] hover:bg-[color:var(--brass)] hover:text-[#16233A] rounded-xl font-bold text-xs transition-colors">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {logs.map(log => (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-200">{log.actorName} <span className="text-[10px] text-slate-500 block">{log.actorRole}</span></td>
                          <td className="py-3 px-4 text-white font-medium">{log.action}</td>
                          <td className="py-3 px-4 text-[color:var(--brass)]">{log.category}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.severity === 'CRITICAL' ? 'bg-[color:var(--clay)] text-white' : 'bg-slate-800 text-slate-300'}`}>{log.severity || 'LOW'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.status === 'SUCCESS' ? 'bg-[color:var(--moss)]/20 text-[color:var(--moss)]' : log.status === 'WARNING' ? 'bg-[color:var(--brass)]/20 text-[color:var(--brass)]' : 'bg-[color:var(--clay)]/20 text-[color:var(--clay)]'}`}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "ALERTS" && (
              <div className="space-y-4">
                <h2 className="display mb-4">Active Security Alerts</h2>
                <div className="grid grid-cols-1 gap-4">
                  {alerts.length === 0 && <div className="text-slate-500 text-sm p-4 text-center">No active alerts.</div>}
                  {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${alert.isResolved ? 'border-[color:var(--moss)]/30 bg-[color:var(--moss)]/5' : 'border-[color:var(--clay)]/30 bg-[color:var(--clay)]/5'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <ShieldAlert className={`w-6 h-6 ${alert.isResolved ? 'text-[color:var(--moss)]' : 'text-[color:var(--clay)]'}`} />
                          <div>
                            <h3 className="font-bold text-white">{alert.eventType}</h3>
                            <p className="text-sm text-slate-300">{alert.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                              <span>IP: {alert.sourceIp || 'N/A'}</span>
                              <span>Target: {alert.targetUserId || 'N/A'}</span>
                              <span>Escalation: {alert.escalationLevel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!alert.acknowledgedAt && !alert.isResolved && (
                            <button onClick={() => handleActionAlert(alert.id, 'acknowledge')} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors">Acknowledge</button>
                          )}
                          {!alert.isResolved && (
                            <button onClick={() => handleActionAlert(alert.id, 'resolve')} className="px-3 py-1 bg-[color:var(--moss)] text-[#16233A] hover:brightness-110 rounded text-xs transition-colors font-bold">Resolve</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "POLICIES" && (
              <div className="max-w-xl mx-auto space-y-6">
                <h2 className="display text-center mb-6">Propose Policy Change (Maker-Checker)</h2>
                <div className="p-4 border border-white/10 bg-black/20 rounded-xl text-sm text-slate-300 mb-6">
                  <span className="text-[color:var(--brass)] font-bold">Rule:</span> You cannot approve your own policy requests. A checker with equal or higher scope must review it.
                </div>
                <form onSubmit={handlePolicy(onSubmitPolicy)} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Policy Type</label>
                    <select {...regPolicy("policyType")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none">
                      <option value="GLOBAL_SECURITY">Global Security Policy</option>
                      <option value="BIOMETRIC">Biometric Policy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Policy ID</label>
                    <input {...regPolicy("policyId")} placeholder="UUID of policy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Field to Change</label>
                      <input {...regPolicy("field")} placeholder="e.g. sessionTimeoutMinutes" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">New Value</label>
                      <input {...regPolicy("value")} placeholder="e.g. 15" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-[color:var(--brass)] text-[#16233A] rounded-xl font-bold text-sm hover:brightness-110">
                    Submit to Maker-Checker Queue
                  </button>
                </form>
              </div>
            )}

            {activeTab === "HEALTH" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-[color:var(--brass)] font-semibold mb-4"><Database className="w-5 h-5" /> Backup Status</h3>
                  {health.backups.length === 0 ? <div className="text-sm text-slate-500">No backup records.</div> : (
                    <div className="space-y-3">
                      {health.backups.map((b: any) => (
                        <div key={b.id} className="p-3 border border-white/10 bg-white/5 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-sm text-white">{b.type} Backup</div>
                            <div className="text-xs font-mono text-slate-500">{new Date(b.startedAt).toLocaleString()}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'SUCCESS' ? 'bg-[color:var(--moss)]/20 text-[color:var(--moss)]' : 'bg-[color:var(--clay)]/20 text-[color:var(--clay)]'}`}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-[color:var(--brass)] font-semibold mb-4"><Activity className="w-5 h-5" /> Maintenance Windows</h3>
                  {health.maintenance.length === 0 ? <div className="text-sm text-slate-500">No scheduled maintenance.</div> : (
                    <div className="space-y-3">
                      {health.maintenance.map((m: any) => (
                        <div key={m.id} className="p-3 border border-white/10 bg-white/5 rounded-lg">
                          <div className="text-sm text-white font-bold">{m.title}</div>
                          <div className="text-xs text-slate-400 mb-2">{m.description}</div>
                          <div className="flex justify-between items-center">
                             <div className="text-[10px] font-mono text-slate-500">{new Date(m.startTime).toLocaleString()}</div>
                             <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-white/10 text-white">{m.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

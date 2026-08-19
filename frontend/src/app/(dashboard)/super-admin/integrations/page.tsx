"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link2, KeyRound, RefreshCw, Activity, ShieldAlert, PowerOff, Database, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function IntegrationsHub() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { toast, toasts, dismissToast } = useToast();

  const { register, handleSubmit, reset } = useForm();
  const { register: rotRegister, handleSubmit: handleRotate, reset: rotReset } = useForm();
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/integrations`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.data);
      }
    } catch (err) {
      toast.error("Error", "Failed to fetch integrations");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRegister = async (data: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/integrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", "Integration registered securely!");
        setShowRegisterForm(false);
        reset();
        fetchIntegrations();
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to register");
    }
  };

  const onRotate = async (data: any) => {
    if (!rotatingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/integrations/${rotatingId}/rotate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ newApiKey: data.newApiKey })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", "API Key rotated securely!");
        setRotatingId(null);
        rotReset();
        fetchIntegrations();
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to rotate key");
    }
  };

  const handleTestConnection = async (id: string) => {
    toast.success("Success", "Testing connection...");
    try {
      const res = await fetch(`http://localhost:5000/api/integrations/${id}/test`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", "Connection verified successfully!");
        fetchIntegrations();
      } else {
        toast.error("Error", result.message || "Connection failed");
      }
    } catch (err) {
      toast.error("Error", "Failed to test connection");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this integration?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/integrations/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Success", "Integration deactivated");
        fetchIntegrations();
      } else {
        toast.error("Error", result.message);
      }
    } catch (err) {
      toast.error("Error", "Failed to deactivate");
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
        case "CORE_BANKING": return <Database className="w-6 h-6 text-blue-400" />;
        case "SMS": return <MessageSquare className="w-6 h-6 text-green-400" />;
        case "HR_SYSTEM": return <Activity className="w-6 h-6 text-purple-400" />;
        default: return <Link2 className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[color:var(--brass)]" /> API & Integrations Gateway
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage external service connections securely via AES-256-GCM encrypted payload routing.</p>
        </div>
        <button onClick={() => setShowRegisterForm(!showRegisterForm)} className="px-4 py-2 bg-[color:var(--brass)] text-[#16233A] rounded-xl font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          {showRegisterForm ? "Cancel" : "+ Register Integration"}
        </button>
      </div>

      {showRegisterForm && (
        <div className="panel bg-black/20 animate-fade-in border-l-4 border-l-[color:var(--brass)]">
          <h3 className="text-lg font-bold text-white mb-4">Register New Service</h3>
          <form onSubmit={handleSubmit(onSubmitRegister)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Service Name</label>
                <input {...register("name")} required placeholder="e.g. Twilio SMS Gateway" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Integration Type</label>
                <select {...register("type")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] outline-none">
                  <option value="SMS">SMS Gateway</option>
                  <option value="CORE_BANKING">Core Banking (T24)</option>
                  <option value="HR_SYSTEM">HR / Payroll System</option>
                  <option value="EMAIL">Email Gateway</option>
                  <option value="CUSTOM_API">Custom API</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Endpoint URL (HTTPS Required)</label>
              <input {...register("endpoint")} required placeholder="https://api.example.com/v1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[color:var(--brass)] outline-none" />
            </div>
            <div>
              <label className="text-xs text-[color:var(--brass)] mb-1 block flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Secret API Key (Will be AES-256-GCM Encrypted)</label>
              <input {...register("apiKey")} type="password" required placeholder="Paste secret token here..." className="w-full bg-black/50 border border-[color:var(--brass)]/30 rounded-xl px-4 py-2.5 text-sm text-[color:var(--brass)] focus:border-[color:var(--brass)] outline-none font-mono" />
              <p className="text-[10px] text-slate-500 mt-1">This key will never be retrievable in plain text after submission.</p>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm">Save & Encrypt</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><span className="animate-spin w-8 h-8 border-2 border-[color:var(--clay)] border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.length === 0 && <div className="col-span-2 text-center py-12 text-slate-500">No active integrations.</div>}
          
          {integrations.map((intg) => (
            <div key={intg.id} className="panel flex flex-col justify-between border-white/10 hover:border-white/20 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      {getIcon(intg.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{intg.name}</h3>
                      <div className="text-xs font-mono text-slate-500">{intg.endpoint}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${intg.status === 'ACTIVE' ? 'bg-[color:var(--moss)]/20 text-[color:var(--moss)]' : 'bg-slate-800 text-slate-400'}`}>
                    {intg.status}
                  </span>
                </div>
                
                <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">API Key</span>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3 h-3 text-[color:var(--brass)]" />
                      <span className="text-sm font-mono text-[color:var(--brass)] tracking-widest">{intg.maskedKey || "No key configured"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Key Version</span>
                    <span className="text-xs text-white">v{intg.secretKeyVersion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Last Sync</span>
                    <span className="text-xs text-slate-300">{intg.lastSyncAt ? new Date(intg.lastSyncAt).toLocaleString() : 'Never'}</span>
                  </div>
                </div>

                {rotatingId === intg.id && (
                  <form onSubmit={handleRotate(onRotate)} className="mb-4 bg-[color:var(--brass)]/10 p-4 rounded-xl border border-[color:var(--brass)]/30 animate-fade-in">
                    <label className="text-xs text-[color:var(--brass)] mb-1 block">New API Key for {intg.name}</label>
                    <div className="flex gap-2">
                      <input {...rotRegister("newApiKey")} type="password" required placeholder="New secret..." className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
                      <button type="submit" className="px-3 py-1.5 bg-[color:var(--brass)] text-black font-bold rounded-lg text-xs">Rotate</button>
                      <button type="button" onClick={() => setRotatingId(null)} className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs">Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button onClick={() => handleTestConnection(intg.id)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Test Connection
                </button>
                <button onClick={() => setRotatingId(intg.id)} className="px-4 py-2 bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] rounded-lg text-xs font-bold transition-all">
                  Rotate Key
                </button>
                <button onClick={() => handleDeactivate(intg.id)} title="Deactivate" className="p-2 bg-[color:var(--clay)]/10 hover:bg-[color:var(--clay)]/20 text-[color:var(--clay)] rounded-lg transition-all">
                  <PowerOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

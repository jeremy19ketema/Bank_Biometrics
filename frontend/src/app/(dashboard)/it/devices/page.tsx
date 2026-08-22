"use client";

import React, { useState, useEffect } from "react";
import { Server, Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { apiClient } from "@/services/apiClient";

interface Device {
  id: string;
  macAddress: string;
  ipAddress: string | null;
  name: string;
  status: "ONLINE" | "OFFLINE" | "UNASSIGNED" | "REPAIR" | "RETIRED";
  branchId: string | null;
  branch: { name: string; code: string } | null;
  lastSyncAt: string | null;
  firmwareVersion: string | null;
}

export default function ITDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, toasts, dismissToast } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await apiClient.get<any>("/api/devices");
      const data = res.data;
      if (data.success) {
        setDevices(data.data);
      } else {
        toast.error("Error", data.message);
      }
    } catch (error) {
      toast.error("Error", "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ONLINE": return "text-[color:var(--moss)] bg-[color:var(--moss)]/10 border-[color:var(--moss)]/30";
      case "OFFLINE": return "text-[color:var(--clay)] bg-[color:var(--clay)]/10 border-[color:var(--clay)]/30";
      default: return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Infrastructure</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Biometric Devices
            </h1>
          </div>
          <button className="bg-[color:var(--brass)] text-[#16233A] px-4 py-2 rounded-xl font-bold hover:bg-[#d7ab5c] transition-colors shadow-lg">
            Register New Device
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="panel flex flex-col items-center justify-center p-12 border-dashed">
            <Server className="w-12 h-12 text-slate-500 mb-4" />
            <p className="text-lg text-[color:var(--ledger-paper)] font-medium">No devices registered</p>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">Provision a new biometric scanner to begin tracking.</p>
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="panel flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${getStatusColor(device.status)}`}>
                  {device.status === "ONLINE" ? <Activity className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)]">{device.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--ledger-paper-dim)] font-mono mt-1">
                    <span>{device.macAddress}</span>
                    <span>•</span>
                    <span>{device.ipAddress || "No IP"}</span>
                    <span>•</span>
                    <span>{device.branch ? `${device.branch.name} (${device.branch.code})` : "Unassigned"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(device.status).split(' ')[0]}`}>
                  {device.status}
                </div>
                <div className="text-[10px] text-[color:var(--ledger-paper-dim)] mt-1">
                  Last Sync: {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : "Never"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

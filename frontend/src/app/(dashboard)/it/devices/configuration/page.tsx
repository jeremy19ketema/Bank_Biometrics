"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import Link from "next/link";
import { BiometricDevice } from "@/types";

export default function DeviceConfigurationPage() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await apiClient.get<any>("/api/devices");
      if (res.success) {
        setDevices(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      <header className="flex-none px-8 py-6 border-b border-white/5 bg-[#111]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white/90">Hardware Configuration</h1>
            <p className="text-sm text-white/50 mt-1">Multi-Modal Biometric Terminal Sync & Provider Status</p>
          </div>
          <Link href="/it/devices" className="px-4 py-2 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
            Back to Inventory
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Hardware SDK Contract Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 flex gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-yellow-400 font-medium">Hardware Integration Pending</h3>
            <p className="text-sm text-yellow-500/80 mt-1">
              Direct USB listeners are disabled. The system is awaiting the vendor SDK Daemon to bind to the secured WebSocket Provider Contract. Biometric scanners must comply with the `AegisMultiModalProvider` interface.
            </p>
          </div>
        </div>

        <section className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-medium text-white/90 border-b border-white/10 pb-4 mb-6">Connected Provider Terminals</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                  <th className="pb-3 pr-4 font-medium">Terminal ID</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Branch</th>
                  <th className="pb-3 pr-4 font-medium">Daemon Sync Status</th>
                  <th className="pb-3 pr-4 font-medium">Last Ping</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/40">Querying Daemon...</td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/40">No registered terminals found in the database.</td>
                  </tr>
                ) : (
                  devices.map(device => (
                    <tr key={device.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4 font-mono text-white/80">{device.serialNumber}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${
                          device.type === 'FINGERPRINT' ? 'bg-blue-500/20 text-blue-400' :
                          device.type === 'IRIS' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {device.type}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-white/60">{device.branchId || 'Unassigned'}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${device.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                          <span className={device.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>
                            {device.status === 'ACTIVE' ? 'SYNCED' : 'DISCONNECTED'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-white/60">
                        {device.status === 'ACTIVE' ? 'Just now' : 'Unknown'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

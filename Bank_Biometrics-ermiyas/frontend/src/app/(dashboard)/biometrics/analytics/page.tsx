export default function BiometricAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Biometric Engine Analytics</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Analytics on false acceptance vs false rejection ratios across hardware scanners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">False Acceptance Rate (FAR)</span>
          <div className="text-2xl font-extrabold text-[color:var(--moss)]">&lt; 0.0001%</div>
          <span className="text-[11px] text-[color:var(--moss)] font-medium">Exceeds PCI Security Benchmark</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">False Rejection Rate (FRR)</span>
          <div className="text-2xl font-extrabold text-[color:var(--brass)]">&lt; 0.01%</div>
          <span className="text-[11px] text-[color:var(--brass)] font-medium">Optimal Sensor Cleanliness</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Hardware Scan Latency</span>
          <div className="text-2xl font-extrabold text-purple-400">12 ms</div>
          <span className="text-[11px] text-slate-400 font-medium">Ultra Low Latency HSM Sync</span>
        </div>
      </div>
    </div>
  );
}
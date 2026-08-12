export default function BiometricStatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Biometric System Hardware Statistics</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Detailed hardware telemetry across optical sensor terminals.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Active Sensor Terminals Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            { name: "HQ Terminal #1", status: "ONLINE (100% Signal)", color: "text-[color:var(--moss)]" },
            { name: "Bole Terminal #1", status: "ONLINE (98% Signal)", color: "text-[color:var(--moss)]" },
            { name: "Kazanchis Terminal #1", status: "ONLINE (99% Signal)", color: "text-[color:var(--moss)]" },
            { name: "Hawassa Terminal #1", status: "ONLINE (97% Signal)", color: "text-[color:var(--moss)]" },
          ].map((t) => (
            <div key={t.name} className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
              <span className="text-slate-400">{t.name}</span>
              <p className={`font-bold font-mono ${t.color}`}>{t.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
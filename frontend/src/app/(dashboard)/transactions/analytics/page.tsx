export default function TransactionAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Financial Transaction Analytics</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Statistical metrics on deposit vs withdrawal trends and high-value clearance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Gross Daily Clearing</span>
          <div className="text-2xl font-extrabold text-white">$18,450,900.00</div>
          <span className="text-[11px] text-[color:var(--moss)] font-medium">+14% vs Previous Session</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Tx Processing Time</span>
          <div className="text-2xl font-extrabold text-[color:var(--brass)]">42 Seconds</div>
          <span className="text-[11px] text-[color:var(--brass)] font-medium">Including Biometric Scan</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Flagged Anomaly Ratio</span>
          <div className="text-2xl font-extrabold text-purple-400">0.001%</div>
          <span className="text-[11px] text-slate-400 font-medium">Zero Fraudulent Overrides</span>
        </div>
      </div>
    </div>
  );
}
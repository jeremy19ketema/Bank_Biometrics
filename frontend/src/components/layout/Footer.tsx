export default function Footer() {
  return (
    <footer className="mt-8 border-t border-[color:var(--line)] py-4 px-6 text-xs text-[color:var(--ledger-paper-dim)] flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-[color:var(--ledger-paper)]">AEGIS BIOMETRIC VERIFICATION CORE</span>
        <span className="text-[color:var(--line-strong)]">|</span>
        <span className="font-mono text-[11px]">CLASSIFICATION: CONFIDENTIAL / BANK USE ONLY</span>
      </div>
      <div className="flex items-center gap-4 text-[11px] font-mono">
        <span>LATENCY: 12ms</span>
        <span>FAR: &lt;0.0001%</span>
        <span>FRR: &lt;0.01%</span>
        <span>&copy; {new Date().getFullYear()} AEGIS FINANCIAL TECH</span>
      </div>
    </footer>
  );
}
import Link from "next/link";
import { ArrowLeft, Fingerprint, Receipt, ShieldCheck } from "lucide-react";

export default function CustomerProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/customers/search" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Customer Account File</h1>
            <p className="text-sm text-white/50 mt-1">Account profile & verified biometric templates for Abebe Bikila.</p>
          </div>
        </div>
        <Link href="/transactions/withdrawal" className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] text-sm font-bold transition-all shadow-lg shadow-[color:var(--brass)]/20 shrink-0">
          <Receipt className="w-4 h-4" />
          <span>Initiate Cash Withdrawal</span>
        </Link>
      </div>

      <div className="bg-[rgba(15,23,40,0.82)] backdrop-blur-xl p-8 rounded-[28px] border border-white/10 shadow-xl space-y-8">
        <div className="flex items-center gap-5 pb-8 border-b border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-black text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            AB
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Abebe Bikila</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[color:var(--brass)] font-semibold">ACC-100842</span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/60">ID-ETH-89021</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-2">
            <span className="text-white/40 uppercase tracking-wider font-semibold text-[10px]">Available Ledger Balance</span>
            <p className="text-[color:var(--moss)] font-extrabold font-mono text-3xl">$145,200.00</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-2">
            <span className="text-white/40 uppercase tracking-wider font-semibold text-[10px]">Account Type</span>
            <p className="text-white font-bold text-lg">PERSONAL SAVINGS</p>
          </div>
          <div className="p-6 rounded-2xl bg-[color:var(--brass)]/5 border border-[color:var(--brass)]/20 space-y-2 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-[color:var(--brass)]" />
            </div>
            <span className="text-[color:var(--brass)] opacity-70 uppercase tracking-wider font-semibold text-[10px] relative z-10">Biometric Status</span>
            <p className="text-[color:var(--brass)] font-bold text-lg flex items-center gap-2 relative z-10">
              <ShieldCheck className="w-5 h-5" />
              <span>ACTIVE & VERIFIED</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
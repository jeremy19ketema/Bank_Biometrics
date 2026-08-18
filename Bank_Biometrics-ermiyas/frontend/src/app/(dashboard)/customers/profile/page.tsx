import Link from "next/link";
import { ArrowLeft, Fingerprint, Receipt, ShieldCheck } from "lucide-react";

export default function CustomerProfilePage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers/search" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Customer Account File</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)]">Account profile & verified biometric templates for Abebe Bikila.</p>
          </div>
        </div>
        <Link href="/transactions/withdrawal" className="btn-primary flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          <span>Initiate Cash Withdrawal</span>
        </Link>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-black text-2xl flex items-center justify-center">
            AB
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Abebe Bikila</h2>
            <p className="text-xs text-slate-400 font-mono">Account #: ACC-100842 | National ID: ID-ETH-89021</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Available Ledger Balance</span>
            <p className="text-[color:var(--moss)] font-extrabold font-mono text-xl">$145,200.00</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Account Type</span>
            <p className="text-slate-100 font-bold text-sm">PERSONAL SAVINGS</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Biometric Status</span>
            <p className="text-[color:var(--brass)] font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[color:var(--brass)]" />
              <span>ACTIVE & VERIFIED</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
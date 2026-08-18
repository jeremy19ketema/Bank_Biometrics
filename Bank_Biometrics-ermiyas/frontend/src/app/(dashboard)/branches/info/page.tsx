import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, ShieldCheck, Building2, Calendar } from "lucide-react";

export default function BranchInfoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/branches"
          className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Branch Information</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Technical specification sheet for Main HQ Branch.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Main HQ Branch</h2>
              <p className="text-xs text-slate-400 font-mono">Code: BR-001 · Registered: Jan 2024</p>
            </div>
          </div>
          <span className="status-chip pass">OPERATIONAL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[color:var(--brass)] mt-0.5" />
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Address & Location</span>
                <p className="text-slate-200 font-medium">Churchill Avenue, HQ Building Floor 1-3, Addis Ababa, Ethiopia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[color:var(--brass)] mt-0.5" />
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Contact Telephony</span>
                <p className="text-slate-200 font-medium">+251 11 551 8800 / Ext 402</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[color:var(--brass)] mt-0.5" />
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Secure Institutional Email</span>
                <p className="text-slate-200 font-medium">br001.hq@aegisbank.eth</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Biometric HSM Module Status</span>
                <p className="text-emerald-400 font-medium">FIPS 140-2 Level 3 Active (Hardware Sync 100%)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last audit: 2026-07-25 · Next scheduled: 2026-08-25</span>
        </div>
      </div>
    </div>
  );
}
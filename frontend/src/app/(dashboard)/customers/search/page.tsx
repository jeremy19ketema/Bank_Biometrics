"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Fingerprint } from "lucide-react";

export default function CustomerSearchPage() {
  const [query, setQuery] = useState("");

  const customers = [
    { accNo: "ACC-100842", name: "Abebe Bikila", nationalId: "ID-ETH-89021", accountType: "SAVINGS", balance: "$145,200.00", enrolled: true },
    { accNo: "ACC-100843", name: "Tigist Assefa", nationalId: "ID-ETH-99104", accountType: "CHECKING", balance: "$480,900.00", enrolled: true },
    { accNo: "ACC-100844", name: "Haile Gebrselassie", nationalId: "ID-ETH-77210", accountType: "CORPORATE", balance: "$1,250,000.00", enrolled: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Customer Account Registry</h1>
          <p className="text-sm text-white/50 mt-1">Search customer files by account number, national ID, or biometric template lookup.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[rgba(15,23,40,0.82)] backdrop-blur-xl p-4 rounded-[20px] border border-white/10 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type account number (e.g. ACC-100842) or national ID..."
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-white/30"
          />
        </div>
        <Link href="/biometrics/scan" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] text-sm font-bold transition-all shadow-lg shadow-[color:var(--brass)]/20 shrink-0 w-full sm:w-auto">
          <Fingerprint className="w-5 h-5" />
          <span>Biometric Lookup</span>
        </Link>
      </div>

      <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] shadow-xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-semibold text-white">Customer Directory</h3>
            <p className="text-xs text-white/50 mt-1 font-mono">{customers.length} matching entries</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B192C]/50">
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Account #</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Customer Name</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">National ID</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Type</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Balance</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Biometric Status</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {customers.map((c) => (
                <tr key={c.accNo} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-5 px-8 font-mono text-sm font-semibold text-[color:var(--brass)]">{c.accNo}</td>
                  <td className="py-5 px-8 text-sm text-white font-medium">{c.name}</td>
                  <td className="py-5 px-8 text-sm font-mono text-white/60">{c.nationalId}</td>
                  <td className="py-5 px-8 text-sm text-white/80">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">{c.accountType}</span>
                  </td>
                  <td className="py-5 px-8 text-right font-mono text-sm text-[color:var(--moss)] font-bold">{c.balance}</td>
                  <td className="py-5 px-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/20">
                      ENROLLED (8 FINGERS)
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <Link href="/customers/profile" className="inline-flex px-4 py-1.5 rounded-lg bg-white/5 hover:bg-[color:var(--brass)]/10 text-white/50 hover:text-[color:var(--brass)] text-xs font-bold transition-all border border-white/10 hover:border-[color:var(--brass)]/30 opacity-80 group-hover:opacity-100 shadow-sm">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
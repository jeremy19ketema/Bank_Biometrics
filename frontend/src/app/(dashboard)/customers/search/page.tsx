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
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Customer Account Registry Search</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Search customer files by account number, national ID, or biometric template lookup.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type account number (e.g. ACC-100842) or national ID..."
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[color:var(--brass)]"
          />
        </div>
        <Link href="/biometrics/scan" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all">
          <Fingerprint className="w-4 h-4" />
          <span>Biometric Lookup</span>
        </Link>
      </div>

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Customer Directory</h3>
          <span className="mono text-xs text-ledger-paper-dim">{customers.length} entries</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Account #</th>
              <th>Customer Name</th>
              <th>National ID</th>
              <th>Account Type</th>
              <th style={{ textAlign: "right" }}>Balance</th>
              <th>Biometric Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.accNo}>
                <td className="mono-cell font-semibold text-[color:var(--brass)]">{c.accNo}</td>
                <td className="font-semibold">{c.name}</td>
                <td className="mono-cell">{c.nationalId}</td>
                <td>{c.accountType}</td>
                <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--moss)]">{c.balance}</td>
                <td>
                  <span className="status-chip pass">ENROLLED (8 FINGERS)</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link href="/customers/profile" className="btn-mini">View Profile</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
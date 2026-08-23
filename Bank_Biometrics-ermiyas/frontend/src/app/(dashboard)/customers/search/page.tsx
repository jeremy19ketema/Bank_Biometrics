"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Fingerprint, Loader2, Search } from "lucide-react";
import { bankApi } from "@/services/bankApi";
import { Customer } from "@/types";

export default function CustomerSearchPage() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    setError("");

    const result = await bankApi.customers(searchQuery);
    if (result.success && Array.isArray(result.data)) {
      setCustomers(result.data as Customer[]);
    } else {
      setError(result.message || "Failed to search customer registry.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Customer Account Registry Search</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Search customer files by account number, name, national ID or phone.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadCustomers(query.trim() || undefined);
        }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass-panel p-4 rounded-xl border border-slate-800"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type account number (e.g. ACC-100842), name, national ID…"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[color:var(--brass)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--brass)]/10 border border-[color:var(--brass)]/30 text-[color:var(--brass)] text-xs font-bold hover:bg-[color:var(--brass)]/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Search</span>
        </button>
        <Link
          href="/biometrics/scan"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Biometric Lookup</span>
        </Link>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{error}</div>
      )}

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Customer Directory</h3>
          <span className="mono text-xs text-ledger-paper-dim">{customers.length} entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Searching registry…
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No customers match{query ? ` "${query}"` : ""}. Try a different search term.
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr key={c.id}>
                    <td className="mono-cell font-semibold text-[color:var(--brass)]">{c.accountNumber}</td>
                    <td className="font-semibold">{c.fullName}</td>
                    <td className="mono-cell">{c.nationalId}</td>
                    <td>{c.accountType}</td>
                    <td style={{ textAlign: "right" }} className={`mono-cell ${c.status === "FROZEN" ? "text-red-400" : "text-[color:var(--moss)]"}`}>
                      {c.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </td>
                    <td>
                      {c.isBiometricEnrolled ? (
                        <span className="status-chip pass">ENROLLED ({c.enrolledFingerprints?.length || 0} FINGERS)</span>
                      ) : (
                        <span className="status-chip fail">NOT ENROLLED</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/customers/profile?id=${c.id}`} className="btn-mini">View Profile</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

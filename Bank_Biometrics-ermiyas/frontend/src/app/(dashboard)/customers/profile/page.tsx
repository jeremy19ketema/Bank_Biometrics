"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Fingerprint, Loader2 } from "lucide-react";
import { bankApi } from "@/services/bankApi";

type ScanRecord = {
  scanId: string;
  fingerIndex: string;
  matchScore: number;
  isMatch: boolean;
  qualityScore: number;
  deviceId: string;
  scannedAt: string;
};

type CustomerDetail = {
  id: string;
  accountNumber: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email: string;
  accountType: string;
  balance: number;
  isBiometricEnrolled: boolean;
  enrolledFingerprints: string[];
  status: "ACTIVE" | "FLAGGED" | "FROZEN";
  createdAt: string;
  updatedAt: string;
  biometricScans?: ScanRecord[];
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomer = useCallback(async () => {
    if (!customerId) {
      setError("No customer selected. Open this page from the registry search.");
      setLoading(false);
      return;
    }

    const result = await bankApi.customer(customerId);
    if (result.success && result.data) {
      setCustomer(result.data as CustomerDetail);
    } else {
      setError(result.message || "Failed to load customer file.");
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading customer file…
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-400">{error || "Customer not found."}</p>
          <Link href="/customers/search" className="btn-mini inline-block">← Return to registry</Link>
        </div>
      </div>
    );
  }

  const initials = customer.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers/search" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Customer Account File</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Registry record and biometric verification history.</p>
        </div>
      </div>

      {/* Identity header */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xl">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{customer.fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">
              {customer.accountNumber} | National ID: {customer.nationalId}
            </p>
          </div>
          <span
            className={`status-chip ${
              customer.status === "ACTIVE" ? "pass" : customer.status === "FLAGGED" ? "info" : "fail"
            }`}
          >
            {customer.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Account Balance</span>
            <p
              className={`font-bold font-mono text-base ${
                customer.status === "FROZEN" ? "text-red-400" : "text-[color:var(--moss)]"
              }`}
            >
              {customer.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Account Type</span>
            <p className="text-slate-200 font-bold font-mono text-sm">{customer.accountType}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Biometric Enrollment</span>
            <p className={`font-bold font-mono text-sm ${customer.isBiometricEnrolled ? "text-emerald-400" : "text-amber-400"}`}>
              {customer.isBiometricEnrolled ? `ENROLLED (${customer.enrolledFingerprints?.length || 0})` : "NOT ENROLLED"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Phone</span>
            <p className="text-slate-200 font-medium font-mono">{customer.phone}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-800 space-y-1 md:col-span-2">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Email</span>
            <p className="text-slate-200 font-medium break-all">{customer.email}</p>
          </div>
        </div>

        {customer.isBiometricEnrolled && customer.enrolledFingerprints?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {customer.enrolledFingerprints.map((finger) => (
              <span key={finger} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                <Fingerprint className="w-3 h-3" />
                {finger.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent scans */}
      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Recent Biometric Verifications</h3>
          <span className="mono text-xs text-ledger-paper-dim">{customer.biometricScans?.length || 0} records</span>
        </div>
        {!customer.biometricScans || customer.biometricScans.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No biometric scans recorded for this customer yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Finger</th>
                  <th style={{ textAlign: "right" }}>Match Score</th>
                  <th style={{ textAlign: "right" }}>Quality</th>
                  <th>Result</th>
                  <th>Device</th>
                  <th style={{ textAlign: "right" }}>Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {customer.biometricScans.map((scan) => (
                  <tr key={scan.scanId}>
                    <td className="mono-cell text-slate-200">{scan.fingerIndex.replace(/_/g, " ")}</td>
                    <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--brass)] font-bold">
                      {scan.matchScore.toFixed(1)}
                    </td>
                    <td style={{ textAlign: "right" }} className="mono-cell">{scan.qualityScore.toFixed(1)}</td>
                    <td>
                      <span className={scan.isMatch ? "status-chip pass" : "status-chip fail"}>
                        {scan.isMatch ? "MATCH" : "NO MATCH"}
                      </span>
                    </td>
                    <td className="mono-cell text-ledger-paper-dim">{scan.deviceId}</td>
                    <td style={{ textAlign: "right" }} className="text-ledger-paper-dim text-xs">
                      {new Date(scan.scannedAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
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

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading…</div>}>
      <ProfileContent />
    </Suspense>
  );
}

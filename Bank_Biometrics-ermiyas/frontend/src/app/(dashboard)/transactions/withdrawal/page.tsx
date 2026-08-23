"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Fingerprint, Loader2, RotateCcw, ShieldAlert } from "lucide-react";
import { bankApi } from "@/services/bankApi";

type Step = "form" | "scan" | "posting" | "done";

type CreatedTx = {
  id: string;
  referenceNumber: string;
  status: string;
  amount: number;
};

export default function CashWithdrawalPage() {
  const [step, setStep] = useState<Step>("form");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("Awaiting contact...");

  const [formError, setFormError] = useState("");
  const [postError, setPostError] = useState("");
  const [createdTx, setCreatedTx] = useState<CreatedTx | null>(null);

  const startScan = useCallback(() => {
    setScanProgress(0);
    setScanStatus("Awaiting contact...");

    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setScanStatus("Match confirmed");
      } else if (current > 25) {
        setScanStatus("Reading ridge pattern...");
      }
      setScanProgress(current);
    }, 80);
  }, []);

  useEffect(() => {
    if (step === "scan") startScan();
  }, [step, startScan]);

  const proceedToScan = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setPostError("");
    setCreatedTx(null);

    if (!accountNumber.trim()) return void setFormError("Customer account number is required.");
    const numeric = parseFloat(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return void setFormError("Enter a valid withdrawal amount.");

    setStep("scan");
  };

  const postTransaction = async () => {
    setPostError("");
    setStep("posting");

    const result = await bankApi.createTransaction({
      accountNumber: accountNumber.trim(),
      amount: parseFloat(amount),
      type: "CASH_WITHDRAWAL",
      biometricVerified: true
    });

    if (result.success && result.data) {
      setCreatedTx(result.data);
      setStep("done");
    } else {
      setPostError(result.message || "The bank rejected this transaction.");
      setStep("form");
    }
  };

  const inputClass =
    "w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/transactions" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Cash Withdrawal Terminal</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
            Cashier withdrawal clearance with mandatory biometric verification.
          </p>
        </div>
      </div>

      {postError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">{postError}</div>
      )}

      {step === "form" && (
        <form onSubmit={proceedToScan} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer Account Number</label>
              <input
                type="text"
                required
                placeholder="e.g. ACC-100842"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={`${inputClass} font-mono text-[color:var(--brass)] font-bold`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Withdrawal Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} font-mono text-emerald-400 font-bold`}
              />
              <p className="text-[10px] text-slate-500 mt-1">Withdrawals above $50,000 require branch manager authorization before payout.</p>
            </div>
            {formError && <p className="text-xs text-red-400 font-medium">{formError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[color:var(--brass)] to-[#d7ab5c] text-[#0F1B2B] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Initiate Verification Scan</span>
          </button>
        </form>
      )}

      {step === "scan" && (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Fingerprint className="w-5 h-5 text-[color:var(--brass)] animate-pulse" />
            <div>
              <p className="text-slate-200 font-bold text-sm">Biometric Key Verification</p>
              <p className="text-slate-400 text-[11px]">Have the customer place their enrolled finger on the optical sensor.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="relative w-[150px] h-[150px] cursor-pointer rounded-full flex items-center justify-center"
              onClick={startScan}
              title="Click to restart scan"
            >
              <svg width="150" height="150" viewBox="0 0 150 150" className="absolute inset-0 -rotate-90">
                <circle cx="75" cy="75" r="64" strokeWidth="6" fill="none" stroke="#1E293B" />
                <circle
                  cx="75"
                  cy="75"
                  r="64"
                  strokeWidth="6"
                  fill="none"
                  stroke="#C69A4C"
                  strokeLinecap="round"
                  strokeDasharray={402.1}
                  strokeDashoffset={402.1 * (1 - scanProgress / 100)}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
              </svg>
              <div className="text-center">
                <div className="mono text-lg font-bold text-[color:var(--ledger-paper)]">{scanProgress}%</div>
              </div>
            </div>
            <span className={`text-xs font-semibold ${scanProgress >= 100 ? "text-emerald-400" : "text-slate-400"}`}>{scanStatus}</span>
          </div>

          <button
            onClick={postTransaction}
            disabled={scanProgress < 100}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{scanProgress < 100 ? "Scanning…" : "Verify & Post Withdrawal"}</span>
          </button>
        </div>
      )}

      {step === "posting" && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 flex items-center justify-center gap-3 text-sm text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-[color:var(--brass)]" /> Posting transaction to ledger…
        </div>
      )}

      {step === "done" && createdTx && (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {createdTx.status === "COMPLETED" ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                createdTx.status === "COMPLETED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {createdTx.status === "COMPLETED" ? "WITHDRAWAL COMPLETED" : "AWAITING MANAGER AUTHORIZATION"}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-3">
              {createdTx.status === "COMPLETED"
                ? `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} paid out`
                : "High-value withdrawal routed for approval"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {createdTx.status === "COMPLETED"
                ? "Ledger updated and customer balance adjusted."
                : "A branch manager must authorize this payout in the approval queue."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 text-left text-xs space-y-3 font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Reference:</span>
              <span className="text-[color:var(--brass)] font-bold">{createdTx.referenceNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Account:</span>
              <span className="text-white font-bold">{accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Biometric:</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setStep("form");
                setAccountNumber("");
                setAmount("");
                setScanProgress(0);
              }}
              className="flex-1 py-3 rounded-xl bg-[#0B192C] border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" /> New Withdrawal
            </button>
            <Link
              href="/transactions/history"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              View Ledger History
            </Link>
          </div>

          {createdTx.status !== "COMPLETED" && (
            <Link href="/transactions/approval" className="inline-flex items-center gap-1.5 text-xs text-[color:var(--brass)] font-semibold hover:underline">
              <ShieldAlert className="w-3.5 h-3.5" /> Go to manager authorization queue
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

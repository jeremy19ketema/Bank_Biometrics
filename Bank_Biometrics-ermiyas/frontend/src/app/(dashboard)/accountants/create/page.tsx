"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { bankApi, getSessionUser } from "@/services/bankApi";

type BranchOption = { id: string; code: string; name: string; city: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateAccountantPage() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<ReturnType<typeof getSessionUser>>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchId] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isBankManager = sessionUser?.role === "BANK_MANAGER";
  const isSuperAdmin = ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER"].includes(sessionUser?.role || "");

  useEffect(() => {
    const user = getSessionUser();
    setSessionUser(user);

    // Bank Managers are bound to their own branch — no selection needed
    if (user?.role === "BANK_MANAGER") {
      if (user.branchId) setBranchId(user.branchId);
      else setError("Your account is not assigned to a branch. Contact a Super Admin.");
      setLoadingBranches(false);
      return;
    }

    async function loadBranches() {
      const result = await bankApi.branches();
      if (result.success && Array.isArray(result.data)) {
        setBranches(result.data as BranchOption[]);
      } else {
        setError(result.message || "Failed to load branches.");
      }
      setLoadingBranches(false);
    }
    loadBranches();
  }, []);

  const validate = (): string => {
    if (!username.trim()) return "Username is required.";
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address.";
    if (!branchId) return "A branch must be assigned.";
    if (!passcode) return "Temporary passcode is required.";
    if (passcode.length < 6) return "Passcode must be at least 6 characters.";
    if (passcode !== confirmPasscode) return "Passcodes do not match.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    const result = await bankApi.createAccountant({
      username: username.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      passcode,
      branchId
    });
    setSaving(false);

    if (result.success) {
      setSuccessMessage(
        result.message ||
          `Accountant ${fullName.trim()} registered successfully. They will use their username and temporary passcode at first login.`
      );
      setUsername("");
      setFullName("");
      setEmail("");
      setPasscode("");
      setConfirmPasscode("");
      setTimeout(() => router.push("/accountants"), 1800);
    } else {
      setError(result.message || "Failed to register accountant.");
    }
  };

  const inputClass =
    "w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)]";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Register Teller / Accountant</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">Provision biometric terminal and cashier privileges.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 font-medium">{error}</div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 font-medium">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username *</label>
            <input
              type="text"
              placeholder="e.g. bethlehem.h"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={saving}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Bethlehem Haile"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email *</label>
            <input
              type="email"
              placeholder="teller@aegisbank.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>

          {isSuperAdmin ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Assigned Branch *</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={loadingBranches || saving}
                className={inputClass}
              >
                <option value="">{loadingBranches ? "Loading branches…" : "Select a branch"}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Assigned Branch</label>
              <input
                type="text"
                readOnly
                value={
                  loadingBranches
                    ? "Loading…"
                    : branches.find((b) => b.id === branchId)?.name || sessionUser?.branchName || "My Branch"
                }
                className={`${inputClass} text-[color:var(--brass)] font-mono`}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isBankManager ? "As Branch Manager you can only register tellers for your own branch." : undefined}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Temporary Passcode *</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm Passcode *</label>
            <input
              type="password"
              placeholder="Repeat passcode"
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href="/accountants" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] font-bold text-xs shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Registering…" : "Register Teller"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

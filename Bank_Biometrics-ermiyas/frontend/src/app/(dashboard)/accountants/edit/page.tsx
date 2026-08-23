"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { bankApi } from "@/services/bankApi";

type StaffStatusOption = "ACTIVE" | "PENDING_FIRST_LOGIN" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE" | "DISABLED";

const STATUS_OPTIONS: { value: StaffStatusOption; label: string; deactivate?: boolean }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "SUSPENDED", label: "Suspended", deactivate: true },
  { value: "INACTIVE", label: "Inactive", deactivate: true },
  { value: "DISABLED", label: "Disabled", deactivate: true }
];

function EditAccountantContent() {
  const searchParams = useSearchParams();
  const staffId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<StaffStatusOption>("ACTIVE");
  const [isActive, setIsActive] = useState(true);

  const loadStaff = useCallback(async () => {
    if (!staffId) {
      setError("No accountant selected. Open this page from the roster.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const result = await bankApi.staffDetails(staffId);
    if (result.success && result.data) {
      const staff = result.data;
      setEmployeeId(`EMP-${String(staff.username).toUpperCase()}`);
      setBranchName(staff.branchName || "Unassigned");
      setFullName(staff.fullName || "");
      setEmail(staff.email || "");
      setStatus((STATUS_OPTIONS.find((s) => s.value === staff.status)?.value || "ACTIVE") as StaffStatusOption);
      setIsActive(!!staff.isActive);
    } else {
      setError(result.message || "Failed to load accountant details.");
    }
    setLoading(false);
  }, [staffId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return;

    setError("");
    setSuccessMessage("");

    if (!fullName.trim()) return void setError("Full name is required.");
    if (!email.trim()) return void setError("Email is required.");

    const nextIsActive = STATUS_OPTIONS.find((s) => s.value === status)?.deactivate ? false : isActive;

    setSaving(true);
    const result = await bankApi.updateStaff(staffId, {
      fullName: fullName.trim(),
      email: email.trim(),
      status,
      isActive: nextIsActive
    });
    setSaving(false);

    if (result.success) {
      setIsActive(nextIsActive);
      setSuccessMessage("Credentials updated successfully.");
    } else {
      setError(result.message || "Failed to update credentials.");
    }
  };

  const inputClass =
    "w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[color:var(--brass)] disabled:opacity-60";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accountants" className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Modify Accountant Credentials</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">
            {loading ? "Loading record…" : `Update operator profile or status for ${employeeId}.`}
          </p>
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

      {!staffId ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
          <p className="text-sm text-slate-400">No accountant ID supplied.</p>
          <Link href="/accountants" className="btn-mini inline-block mt-3">Return to roster</Link>
        </div>
      ) : loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading accountant…
        </div>
      ) : (
        <form onSubmit={handleSave} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Teller ID</label>
              <input
                type="text"
                readOnly
                value={employeeId}
                className={`${inputClass} text-[color:var(--brass)] font-mono font-bold`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch</label>
              <input type="text" readOnly value={branchName} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatusOption)}
                disabled={saving}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Link href="/accountants" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] font-bold text-xs shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving…" : "Update Credentials"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function EditAccountantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading…</div>}>
      <EditAccountantContent />
    </Suspense>
  );
}

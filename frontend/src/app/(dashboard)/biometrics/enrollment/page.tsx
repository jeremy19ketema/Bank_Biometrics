"use client";

import React, { useState } from "react";
import { Fingerprint, CheckCircle2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { apiClient } from "@/services/apiClient";

export default function EnrollmentConsentPage() {
  const [loading, setLoading] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const { toast, toasts, dismissToast } = useToast();

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.post<any>("/api/enrollment/consent", {
        targetUserId,
        consentVersion: "v1.0.0",
        captureMethod: "DIGITAL_SIGNATURE"
      });

      const data = res.data;
      if (data.success) {
        toast.success("Success", "Biometric consent captured securely.");
        setTargetUserId("");
      } else {
        toast.error("Error", data.message);
      }
    } catch (error) {
      toast.error("Error", "Failed to submit consent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Biometrics</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Staff Consent Capture
            </h1>
          </div>
          <div className="w-12 h-12 rounded-full border border-[color:var(--moss)]/30 bg-[color:var(--moss)]/10 text-[color:var(--moss)] flex items-center justify-center">
             <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </section>

      <div className="panel">
        <div className="flex items-start gap-4 mb-6">
          <Fingerprint className="w-8 h-8 text-[color:var(--brass)] flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)]">Legal Consent for Biometric Capture</h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">
              Prior to enrolling fingerprints or facial data, explicit legal consent must be recorded in the immutable audit log.
            </p>
          </div>
        </div>

        <form onSubmit={handleConsentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[color:var(--ledger-paper-dim)] mb-1">Target User ID</label>
            <input 
              type="text" 
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none"
              required
            />
          </div>
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
             <input type="checkbox" required className="mt-1" />
             <div className="text-sm text-[color:var(--ledger-paper)]">
               I confirm that the staff member has read, understood, and signed the Biometric Data Processing Agreement (v1.0.0). I am acting as the authorized Maker.
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-[color:var(--brass)] text-[#16233A] font-bold shadow-lg hover:bg-[#d7ab5c] transition flex items-center gap-2">
              {loading && <span className="animate-spin w-4 h-4 border-2 border-[#16233A] border-t-transparent rounded-full" />}
              Capture Consent
            </button>
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Globe,
  Award
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forexUserSchema, FOREXUserFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function CreateFOREXUserPage() {
  const router = useRouter();
  const { toasts, toast, dismissToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FOREXUserFormValues>({
    resolver: zodResolver(forexUserSchema),
    defaultValues: {
      status: "ACTIVE",
    },
  });

  const onSubmit = async (data: FOREXUserFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)aegis_auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        },
        body: JSON.stringify({
          ...data,
          role: "SUPER_ADMIN_FOREX",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create FOREX user");
      }

      toast.success(
        "FOREX User Created",
        "The user has been created and is pending approval."
      );
      
      setTimeout(() => {
        router.push("/forex/users");
      }, 2000);
    } catch (error: any) {
      toast.error("Creation Failed", error.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Link
              href="/forex/users"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Add FOREX User</h1>
              <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">
                Create a new currency exchange or treasury specialist.
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="p-8 border-b border-white/10 bg-gradient-to-r from-[color:var(--brass)]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] flex items-center justify-center border border-[color:var(--brass)]/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">FOREX Specialist Profile</h2>
                <p className="text-xs text-white/50">Enter the dealer's personal and departmental details.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <UserPlus className="w-4 h-4 text-[color:var(--brass)]" />
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    {...register("fullName")}
                    placeholder="E.g. Sarah Jenkins"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
                  />
                  <UserPlus className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[color:var(--brass)] transition-colors" />
                </div>
                {errors.fullName && <p className="text-xs text-[color:var(--clay)] font-medium mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Mail className="w-4 h-4 text-[color:var(--brass)]" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="sarah.j@aegis.bank"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
                  />
                  <Mail className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[color:var(--brass)] transition-colors" />
                </div>
                {errors.email && <p className="text-xs text-[color:var(--clay)] font-medium mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Phone className="w-4 h-4 text-[color:var(--brass)]" />
                  Phone Number
                </label>
                <div className="relative group">
                  <input
                    {...register("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
                  />
                  <Phone className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[color:var(--brass)] transition-colors" />
                </div>
                {errors.phone && <p className="text-xs text-[color:var(--clay)] font-medium mt-1">{errors.phone.message}</p>}
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Briefcase className="w-4 h-4 text-[color:var(--brass)]" />
                  Specialization
                </label>
                <div className="relative group">
                  <input
                    {...register("specialization")}
                    placeholder="E.g. Currency Exchange"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
                  />
                  <Briefcase className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[color:var(--brass)] transition-colors" />
                </div>
                {errors.specialization && <p className="text-xs text-[color:var(--clay)] font-medium mt-1">{errors.specialization.message}</p>}
              </div>

              {/* Certification Level */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Award className="w-4 h-4 text-[color:var(--brass)]" />
                  Certification Level
                </label>
                <div className="relative group">
                  <input
                    {...register("certificationLevel")}
                    placeholder="E.g. Senior Dealer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
                  />
                  <Award className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[color:var(--brass)] transition-colors" />
                </div>
                {errors.certificationLevel && <p className="text-xs text-[color:var(--clay)] font-medium mt-1">{errors.certificationLevel.message}</p>}
              </div>

              {/* Initial Status */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <ShieldAlert className="w-4 h-4 text-[color:var(--brass)]" />
                  Initial Status
                </label>
                <div className="relative group">
                  <select
                    {...register("status")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all appearance-none"
                  >
                    <option value="ACTIVE" className="bg-[#0f1728] text-white">ACTIVE</option>
                    <option value="INACTIVE" className="bg-[#0f1728] text-white">INACTIVE</option>
                    <option value="SUSPENDED" className="bg-[#0f1728] text-white">SUSPENDED</option>
                  </select>
                  <ShieldAlert className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[color:var(--brass)] transition-colors" />
                </div>
                {errors.status && <p className="text-xs text-[color:var(--clay)] font-medium mt-1">{errors.status.message}</p>}
              </div>
            </div>

            {/* Warning / Note */}
            <div className="mt-8 p-4 rounded-xl bg-[color:var(--brass)]/5 border border-[color:var(--brass)]/20 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[color:var(--brass)] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[color:var(--brass)]">Approval Required</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Creating a new FOREX user requires Super Admin approval. Once submitted, the request will be routed to the pending approval queue. An initial passcode will be generated upon approval.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-end gap-4">
              <Link
                href="/forex/users"
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-bold transition-all border border-white/10"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] text-sm font-bold transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

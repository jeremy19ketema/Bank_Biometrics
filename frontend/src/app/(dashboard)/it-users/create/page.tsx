"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, UserPlus } from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { itUserSchema, ITUserFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function CreateITUserPage() {
  const router = useRouter();
  const { itUsers, addITUser } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const nextCode = `IT-${String(itUsers.length + 1).padStart(3, "0")}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ITUserFormValues>({
    resolver: zodResolver(itUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      department: "",
      status: "ACTIVE",
    },
  });

  const onSubmit = (data: ITUserFormValues) => {
    addITUser({
      employeeId: nextCode,
      ...data,
    });
    toast.success("IT User Created", `${data.fullName} has been provisioned with system access.`);
    setTimeout(() => router.push("/it-users"), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/it-users"
          className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Add IT System Administrator</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">
            Provision new IT personnel with infrastructure access credentials.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Employee ID
            </label>
            <input
              type="text"
              readOnly
              value={nextCode}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-[color:var(--brass)] font-mono font-bold cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Solomon Tesfaye"
              {...register("fullName")}
              className="input-field"
            />
            {errors.fullName && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Institutional Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              placeholder="s.tesfaye@aegisbank.eth"
              {...register("email")}
              className="input-field"
            />
            {errors.email && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              placeholder="+251-911-123-456"
              {...register("phone")}
              className="input-field"
            />
            {errors.phone && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Department <span className="text-rose-400">*</span>
            </label>
            <select {...register("department")} className="input-field">
              <option value="">Select Department</option>
              <option value="Infrastructure & Security">Infrastructure & Security</option>
              <option value="Database Administration">Database Administration</option>
              <option value="Biometric Systems">Biometric Systems</option>
              <option value="Network Operations">Network Operations</option>
              <option value="Application Support">Application Support</option>
              <option value="Cyber Security">Cyber Security</option>
            </select>
            {errors.department && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.department.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Initial Status
            </label>
            <select {...register("status")} className="input-field">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--line)]">
          <Link
            href="/it-users"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? "Provisioning..." : "Provision IT User"}</span>
          </button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
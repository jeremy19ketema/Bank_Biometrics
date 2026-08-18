"use client";

import { useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, UserCog } from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { itUserSchema, ITUserFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

function EditITUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const { getITUserById, updateITUser } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const user = userId ? getITUserById(userId) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ITUserFormValues>({
    resolver: zodResolver(itUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        status: user.status,
      });
    }
  }, [user, reset]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">IT user not found.</p>
          <Link
            href="/it-users"
            className="inline-flex items-center gap-2 mt-4 text-[color:var(--brass)] hover:underline text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to IT User Management
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ITUserFormValues) => {
    updateITUser(user.id, data);
    toast.success("IT User Updated", `${data.fullName}'s credentials have been updated.`);
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
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Modify IT User Credentials</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)]">
            Update access parameters for <span className="text-[color:var(--brass)] font-mono">{user.employeeId}</span>.
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
              value={user.employeeId}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-[color:var(--brass)] font-mono font-bold cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input type="text" {...register("fullName")} className="input-field" />
            {errors.fullName && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Institutional Email <span className="text-rose-400">*</span>
            </label>
            <input type="email" {...register("email")} className="input-field" />
            {errors.email && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contact Phone
            </label>
            <input type="text" {...register("phone")} className="input-field" />
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
              Access Status
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
            <UserCog className="w-4 h-4" />
            <span>{isSubmitting ? "Updating..." : "Save Modifications"}</span>
          </button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function EditITUserPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">Loading IT user data...</p>
        </div>
      }
    >
      <EditITUserForm />
    </Suspense>
  );
}
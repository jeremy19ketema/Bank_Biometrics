"use client";

import { useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Save, X } from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { branchSchema, BranchFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

function EditBranchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get("id");

  const { updateBranch, getBranchById } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const branch = branchId ? getBranchById(branchId) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
  });

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        city: branch.city,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        dailyTransactionLimit: branch.dailyTransactionLimit,
        status: branch.status,
      });
    }
  }, [branch, reset]);

  if (!branch) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">Branch not found.</p>
          <Link
            href="/branches"
            className="inline-flex items-center gap-2 mt-4 text-[color:var(--brass)] hover:underline text-xs"
          >
            Return to Branches
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: BranchFormValues) => {
    updateBranch(branch.id, data);
    toast.success("Branch Updated", `${data.name} configuration has been saved.`);
    setTimeout(() => router.push("/branches"), 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[color:var(--ledger-paper-dim)] uppercase tracking-[0.1em]">
        <Link className="hover:text-[color:var(--brass)] transition-colors" href="/branches">
          Branches
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[color:var(--line-strong)]" />
        <span className="text-[color:var(--ledger-paper)]">Edit Branch</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Edit Branch Configuration</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
          Update operational parameters for node <span className="text-[color:var(--brass)] font-mono">{branch.code}</span>.
        </p>
      </div>

      {/* Form */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Branch Code
              </label>
              <input
                type="text"
                readOnly
                value={branch.code}
                className="input-field font-mono text-[color:var(--brass)] font-bold cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Branch Name <span className="text-rose-400">*</span>
              </label>
              <input type="text" {...register("name")} className="input-field" />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                City <span className="text-rose-400">*</span>
              </label>
              <input type="text" {...register("city")} className="input-field" />
              {errors.city && <p className="text-rose-400 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Address <span className="text-rose-400">*</span>
              </label>
              <input type="text" {...register("address")} className="input-field" />
              {errors.address && <p className="text-rose-400 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Operational Status
              </label>
              <select {...register("status")} className="input-field cursor-pointer">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Daily Volume Limit ($)
              </label>
              <input
                type="number"
                {...register("dailyTransactionLimit", { valueAsNumber: true })}
                className="input-field font-mono text-[color:var(--brass)]"
              />
              {errors.dailyTransactionLimit && (
                <p className="text-rose-400 text-xs mt-1">{errors.dailyTransactionLimit.message}</p>
              )}
            </div>
          </div>

          <hr className="border-[color:var(--line)]" />

          <div className="flex justify-end gap-3">
            <Link
              href="/branches"
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
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function EditBranchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto glass-panel p-12 rounded-2xl border border-slate-800 text-center">
        <p className="text-slate-400 text-sm">Loading branch data...</p>
      </div>
    }>
      <EditBranchForm />
    </Suspense>
  );
}
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Save, X, Building2 } from "lucide-react";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { branchSchema, BranchFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function CreateBranchPage() {
  const router = useRouter();
  const { branches, addBranch } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const nextCode = `BR-${String(branches.length + 1).padStart(3, "0")}`;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      code: nextCode,
      name: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      dailyTransactionLimit: 1000000,
      status: "ACTIVE",
    },
  });

  const onSubmit = async (data: BranchFormValues) => {
    const { success, message } = await useSuperAdminStore.getState().createBranch(data);

    if (success) {
      toast.success("Branch Provisioned", `${data.name} has been successfully created.`);
      setTimeout(() => router.push("/branches"), 1200);
    } else {
      toast.error("Provisioning Failed", message || "Failed to create branch.");
      if (message?.toLowerCase().includes("code")) {
        setError("root", { message: message });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[color:var(--ledger-paper-dim)] uppercase tracking-[0.1em]">
        <Link className="hover:text-[color:var(--brass)] transition-colors" href="/branches">
          Branches
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[color:var(--line-strong)]" />
        <span className="text-[color:var(--ledger-paper)]">Provision Node</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--ledger-paper)]">Provision New Branch</h1>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Initialize a new operational node within the regional hierarchy.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-8 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[color:var(--brass)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Core Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Building2 className="w-4 h-4 text-[color:var(--brass)]" /> Core Details
              </h3>
              
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Branch Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. BR-001"
                  {...register("code")}
                  className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] font-bold focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-slate-600 shadow-inner"
                />
                {errors.code && <p className="text-rose-400 text-xs mt-1">{errors.code.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Branch Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Central Node"
                  {...register("name")}
                  className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-slate-600 shadow-inner"
                />
                {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </label>
                  <select {...register("status")} className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Daily Limit (ETB) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="5000000"
                    {...register("dailyTransactionLimit", { valueAsNumber: true })}
                    className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  {errors.dailyTransactionLimit && <p className="text-rose-400 text-xs mt-1">{errors.dailyTransactionLimit.message}</p>}
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                 Contact & Location
              </h3>
              
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  {...register("city")}
                  className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-slate-600 shadow-inner"
                />
                {errors.city && <p className="text-rose-400 text-xs mt-1">{errors.city.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Physical Address <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter complete street address..."
                  {...register("address")}
                  className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all resize-none placeholder:text-slate-600 shadow-inner"
                />
                {errors.address && <p className="text-rose-400 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+251-11-..."
                    {...register("phone")}
                    className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="branch@aegisbank.eth"
                    {...register("email")}
                    className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
            <Link
              href="/branches"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors border border-white/10"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Provisioning..." : "Provision Branch"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
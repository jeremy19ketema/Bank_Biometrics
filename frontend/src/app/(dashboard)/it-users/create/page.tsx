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
  const { itUsers, createUser } = useSuperAdminStore();
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

  const onSubmit = async (data: ITUserFormValues) => {
    const res = await createUser({
      username: data.email.split("@")[0], // Generate username from email
      fullName: data.fullName,
      email: data.email,
      role: "SUPER_ADMIN_IT",
      department: data.department,
      passcode: "TempPass123!" // Default temporary passcode
    });

    if (res.success) {
      toast.success("Approval Requested", `${data.fullName} has been sent for Super Admin Manager approval.`);
      setTimeout(() => router.push("/it-users"), 1500);
    } else {
      toast.error("Failed to create IT User", res.message || "Unknown error occurred.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <Link
          href="/it-users"
          className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Add IT System Administrator</h1>
          <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">
            Provision new IT personnel with infrastructure access credentials.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-8 shadow-xl backdrop-blur-xl space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Employee ID
            </label>
            <input
              type="text"
              readOnly
              value={nextCode}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-[color:var(--brass)] font-mono font-bold cursor-not-allowed opacity-80"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Solomon Tesfaye"
              {...register("fullName")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
            />
            {errors.fullName && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Institutional Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              placeholder="s.tesfaye@aegisbank.eth"
              {...register("email")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
            />
            {errors.email && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              placeholder="+251-911-123-456"
              {...register("phone")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30"
            />
            {errors.phone && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Department <span className="text-rose-400">*</span>
            </label>
            <select {...register("department")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30">
              <option value="" className="bg-[#0f1728] text-white">Select Department</option>
              <option value="Infrastructure & Security" className="bg-[#0f1728] text-white">Infrastructure & Security</option>
              <option value="Database Administration" className="bg-[#0f1728] text-white">Database Administration</option>
              <option value="Biometric Systems" className="bg-[#0f1728] text-white">Biometric Systems</option>
              <option value="Network Operations" className="bg-[#0f1728] text-white">Network Operations</option>
              <option value="Application Support" className="bg-[#0f1728] text-white">Application Support</option>
              <option value="Cyber Security" className="bg-[#0f1728] text-white">Cyber Security</option>
            </select>
            {errors.department && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.department.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Initial Status
            </label>
            <select {...register("status")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] outline-none transition-all placeholder:text-white/30">
              <option value="ACTIVE" className="bg-[#0f1728] text-white">ACTIVE</option>
              <option value="INACTIVE" className="bg-[#0f1728] text-white">INACTIVE</option>
              <option value="SUSPENDED" className="bg-[#0f1728] text-white">SUSPENDED</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <Link
            href="/it-users"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-all border border-white/10"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
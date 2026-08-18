"use client";

import { useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { managerSchema, ManagerFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

function EditManagerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("id");

  const { branches, getManagerById, updateManager } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const manager = managerId ? getManagerById(managerId) : null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
  });

  useEffect(() => {
    if (manager) {
      reset({
        fullName: manager.fullName,
        email: manager.email,
        phone: manager.phone,
        branchId: manager.branchId,
        status: manager.status === "ON_LEAVE" || manager.status === "SUSPENDED" ? manager.status : "ACTIVE",
        assignedDate: manager.assignedDate,
      });
    }
  }, [manager, reset]);

  const selectedBranchId = watch("branchId");
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  if (!manager) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">Manager not found.</p>
          <Link href="/managers" className="text-[color:var(--brass)] hover:underline text-xs mt-2">← Return to Bank Managers</Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ManagerFormValues) => {
    updateManager(manager.id, {
      ...data,
      branchName: selectedBranch?.name || manager.branchName,
    });
    toast.success("Manager Updated", `${data.fullName}'s profile has been saved.`);
    setTimeout(() => router.push("/managers"), 1200);
  };

  return (
    <>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Edit Bank Manager</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Update profile information and system access for {manager.fullName}.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/managers" className="btn-mini">Cancel</Link>
            <button type="submit" form="edit-manager-form" disabled={isSubmitting} className="btn-primary">Save Changes</button>
          </div>
        </div>

        <form id="edit-manager-form" onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Full Name</label>
              <input className="input-field" type="text" {...register("fullName")} />
              {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="input-field" type="email" {...register("email")} />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="input-field" type="tel" {...register("phone")} />
              {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="form-label">Primary Branch</label>
              <select className="input-field" {...register("branchId")}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
              </select>
              {errors.branchId && <p className="text-error text-xs mt-1">{errors.branchId.message}</p>}
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input-field" {...register("status")}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div>
              <label className="form-label">Assigned Date</label>
              <input type="date" {...register("assignedDate")} className="input-field" />
            </div>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default function EditManagerPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
      <EditManagerForm />
    </Suspense>
  );
}
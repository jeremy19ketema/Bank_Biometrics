"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { managerSchema, ManagerFormValues } from "@/lib/validations";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function CreateManagerPage() {
  const router = useRouter();
  const { managers, branches, addManager } = useSuperAdminStore();
  const { toasts, toast, dismissToast } = useToast();

  const nextCode = `MGR-${String(100 + managers.length + 1)}`;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      branchId: "",
      status: "ACTIVE",
      assignedDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedBranchId = watch("branchId");
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const onSubmit = (data: ManagerFormValues) => {
    addManager({
      employeeId: nextCode,
      ...data,
      branchName: selectedBranch?.name || "",
    });
    toast.success("Manager Created", `${data.fullName} has been added successfully.`);
    setTimeout(() => router.push("/managers"), 1200);
  };

  return (
    <>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Add New Manager</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Create a new administrative profile for branch oversight.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/managers" className="btn-mini">Cancel</Link>
            <button type="submit" form="create-manager-form" disabled={isSubmitting} className="btn-primary">Save Manager</button>
          </div>
        </div>

        <form id="create-manager-form" onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Full Name</label>
              <input className="input-field" placeholder="Enter full name" type="text" {...register("fullName")} />
              {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="input-field" placeholder="manager@omnibank.com" type="email" {...register("email")} />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="input-field" placeholder="+1 (555) 000-0000" type="tel" {...register("phone")} />
              {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="form-label">Primary Branch</label>
              <select className="input-field" {...register("branchId")}>
                <option value="">Select a branch...</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
              </select>
              {errors.branchId && <p className="text-error text-xs mt-1">{errors.branchId.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">Status</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="ACTIVE" className="text-primary" {...register("status")} />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="INACTIVE" className="text-primary" {...register("status")} />
                  <span>Inactive</span>
                </label>
              </div>
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
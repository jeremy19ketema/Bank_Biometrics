"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

const getBreadcrumbLabel = (segment: string) => {
    const labels: Record<string, string> = {
      "super-admin": "Dashboard",
      branches: "Branch Management",
      transactions: "Transactions",
      "reports": "Reports",
      system: "System",
      accountants: "Accountants",
      managers: "Bank Managers",
      "it-users": "IT Users",
      "branch-it": "Branch IT",
      forex: "FOREX",
      biometrics: "Biometrics",
      customers: "Customers",
      governance: "Governance",
      roles: "Roles",
      permissions: "Permissions",
      settings: "Settings",
      approvals: "Approval Queue",
      "change-credentials": "Change Credentials",
      manager: "Manager Dashboard",
      "internal-manager": "Operations Oversight",
      it: "IT Operations",
      accountant: "Teller Terminal",
    };
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant w-full h-16 flex justify-between items-center px-lg sticky top-0 z-30">
      <div className="flex items-center gap-sm">
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-sm text-on-surface-variant hover:bg-surface-container-low rounded">
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* Breadcrumb */}
        <div className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px]">home</span>
          {segments.length > 0 ? (
            segments.map((seg, i) => (
              <span key={seg} className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className={i === segments.length - 1 ? "font-bold text-on-surface" : ""}>
                  {getBreadcrumbLabel(seg)}
                </span>
              </span>
            ))
          ) : (
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-bold text-on-surface">Dashboard</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-md">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="pl-xl pr-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-body-md font-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 w-64 min-h-[40px]"
            placeholder="Search entity..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-xs text-on-surface-variant">
          <button className="p-sm hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-sm hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="p-sm hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden">
          <img
            alt="Super Admin Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXTUK5oMrCSCAuuUvhcMQqBcRqi_Ak-tWCfX2nF9jxfXaJyq7n_IAQUQNMKqpf4nH1BqpRgr2vU4r7FpbC0nvFqnRRDGf9nUzUoziScmLWIDGfkXG8KoF4DYpIetyZZ3WWgmPRm98lyIagMK3XQDaruSpuysFVLd-ISLYbvcKxAECDLvpa0kLCzHP2wMP4fPevBjWv-0KtyYeEYbJfyRiRu3aKF7DpO1mpQqN6m_-PhirYz-6A7o5w7g"
          />
        </div>
      </div>
    </header>
  );
}


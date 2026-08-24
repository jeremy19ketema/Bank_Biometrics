"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Clock,
  Code,
  Fingerprint,
  Globe,
  Receipt,
  LogOut,
  UserRound,
  Currency,
  UserPlus,
  UserMinus,
  CalendarDays,
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type UserRole = "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER" | "SUPER_ADMIN_IT" | "SUPER_ADMIN_FOREX" | "BANK_MANAGER" | "BRANCH_IT" | "ACCOUNTANT" | "HR";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.FC<{ className?: string }>;
  isSection?: boolean;
  subItems?: NavItem[];
}

// Role → dashboard path mapping
const roleDashboard: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin",
  SUPER_ADMIN_MANAGER: "/internal-manager",
  SUPER_ADMIN_IT: "/it",
  SUPER_ADMIN_FOREX: "/forex",
  BANK_MANAGER: "/manager",
  BRANCH_IT: "/it",
  ACCOUNTANT: "/accountant",
  HR: "/hr-dash",
};

const VaultSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("aegis_user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserRole(user.role);
      }
    } catch {
      // ignore
    }
  }, []);

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const getNavItems = (): NavItem[] => {
    const role = userRole;

    if (role === "SUPER_ADMIN") {
      return [
        { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
        { label: "Approval Queue", href: "/approvals", icon: Clock },
        { label: "Branches", href: "/branches", icon: Building2 },
        { label: "Users", href: "/users", icon: Users }, // ✅ Now points to unified Users page
        { label: "Roles & Permissions", href: "/governance/roles", icon: ShieldCheck },
        { label: "Audit Logs", href: "/reports/system", icon: FileText },
        { label: "System Settings", href: "/settings/system", icon: Settings },
      ];
    }

    if (role === "SUPER_ADMIN_MANAGER") {
      return [
        { label: "Dashboard", href: "/internal-manager", icon: LayoutDashboard },
        { label: "Approval Queue", href: "/approvals", icon: Clock },
        { 
          label: "Users", 
          icon: Users,
          subItems: [
            { label: "IT Users", href: "/it-users", icon: Code },
            { label: "FOREX Operations", href: "/forex/users", icon: Globe },
          ]
        },
        { label: "Reports", href: "/reports/system", icon: Receipt },
      ];
    }

    if (role === "SUPER_ADMIN_IT") {
      return [
        { label: "Dashboard", href: "/it", icon: LayoutDashboard },
        { label: "IT Users", href: "/it-users", icon: Code },
        { label: "Biometrics", href: "/biometrics", icon: Fingerprint },
        { label: "Reports", href: "/reports/system", icon: Receipt },
        { label: "System Settings", href: "/settings/system", icon: Settings },
      ];
    }

    if (role === "SUPER_ADMIN_FOREX") {
      return [
        { label: "Dashboard", href: "/forex", icon: LayoutDashboard },
        { label: "Transactions", href: "/transactions", icon: Currency },
        { label: "Customers", href: "/customers/search", icon: Users },
        { label: "Reports", href: "/reports/system", icon: Receipt },
      ];
    }

    if (role === "BANK_MANAGER") {
      return [
        { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
        { label: "Transactions", href: "/transactions", icon: Currency },
        { label: "Approvals", href: "/approvals", icon: Clock },
        { label: "Accountants", href: "/accountants", icon: UserRound },
        { label: "Customers", href: "/customers/search", icon: Users },
        { label: "Reports", href: "/reports/system", icon: Receipt },
      ];
    }

    if (role === "BRANCH_IT") {
      return [
        { label: "Dashboard", href: "/it", icon: LayoutDashboard },
        { label: "Reports", href: "/reports/system", icon: Receipt },
      ];
    }

    if (role === "ACCOUNTANT") {
      return [
        { label: "Dashboard", href: "/accountant", icon: LayoutDashboard },
        { label: "Transactions", href: "/transactions", icon: Currency },
        { label: "Customers", href: "/customers/search", icon: Users },
        { label: "Biometrics", href: "/biometrics", icon: Fingerprint },
      ];
    }

    if (role === "HR") {
      return [
        { label: "Dashboard", href: "/hr-dash", icon: LayoutDashboard },
        { label: "People", isSection: true },
        { label: "Employee Directory", href: "/hr-dash/directory", icon: Users },
        { label: "Employee Lifecycle", isSection: true },
        { label: "Onboarding", href: "/hr-dash/onboarding", icon: UserPlus },
        { label: "Offboarding", href: "/hr-dash/offboarding", icon: UserMinus },
        { label: "Time & Leave", isSection: true },
        { label: "Attendance & Exceptions", href: "/hr-dash/attendance", icon: Clock },
        { label: "Leave Management", href: "/hr-dash/leave", icon: CalendarDays },
        { label: "Talent & Compliance", isSection: true },
        { label: "Training & Compliance", href: "/hr-dash/training", icon: GraduationCap },
        { label: "Operations", isSection: true },
        { label: "Approval Queue", href: "/approvals", icon: ShieldCheck },
        { label: "Reports & Audit Log", href: "/reports/system", icon: FileText },
      ];
    }

    // Fallback – includes the new Users page
    return [
      { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
      { label: "Branches", href: "/branches", icon: Building2 },
      { label: "Users", href: "/users", icon: Users },
      { label: "Audit Logs", href: "/reports/system", icon: FileText },
    ];
  };

  const navItems = getNavItems();

  const handleSignOut = () => {
    sessionStorage.removeItem("aegis_user");
    document.cookie = "aegis_auth_token=; path=/; max-age=0";
    document.cookie = "aegis_user=; path=/; max-age=0";
    router.push("/login");
  };

  const handleGlyphClick = () => {
    if (userRole && roleDashboard[userRole]) {
      router.push(roleDashboard[userRole]);
    } else {
      router.push("/super-admin");
    }
  };

  const isSettingsPage = pathname === "/settings/system";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {isSettingsPage && (
        <style>{`
          .app-shell > .main-wrapper {
            margin-left: 0 !important;
            transition: margin-left 0.3s ease;
          }
        `}</style>
      )}

      {/* Trigger area to reveal sidebar when collapsed */}
      {isSettingsPage && !isHovered && (
        <div 
          className="fixed left-0 top-0 h-screen w-6 z-50 cursor-pointer bg-gradient-to-r from-[rgba(15,23,40,0.5)] to-transparent"
          onMouseEnter={() => setIsHovered(true)}
        />
      )}

      <aside 
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[color:var(--line)] bg-[color:var(--vault-charcoal)] py-4 px-3 transition-transform duration-300 ease-in-out shadow-2xl ${
          isSettingsPage && !isHovered ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 pb-5">
          <div
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[color:var(--brass)] font-display text-[17px] text-[color:var(--brass)]"
            onClick={handleGlyphClick}
          >
            A
          </div>
          <div className="overflow-hidden">
            <p className="font-mono text-[11px] tracking-[0.12em] text-[color:var(--ledger-paper-dim)]">
              AEGIS
            </p>
            <p className="text-[10px] text-[color:var(--ledger-paper-dim)]/60">
              {userRole ? userRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "Loading..."}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item, index) => {
            if (item.isSection) {
              return (
                <div key={`section-${index}`} className="mt-4 mb-1 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--ledger-paper-dim)] opacity-70">
                    {item.label}
                  </span>
                </div>
              );
            }
            
            const Icon = item.icon!;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus[item.label];
            
            if (hasSubItems) {
              // A menu that has subItems (but no href of its own)
              const anyChildActive = item.subItems!.some(child => isActive(child.href!));
              
              return (
                <div key={item.label} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                      anyChildActive || isExpanded
                        ? "bg-[rgba(244,239,223,0.06)] text-[color:var(--ledger-paper)]"
                        : "text-[color:var(--ledger-paper-dim)] hover:bg-[rgba(244,239,223,0.06)] hover:text-[color:var(--ledger-paper)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 shrink-0 ${anyChildActive ? "text-[color:var(--brass)]" : ""}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-9 flex flex-col gap-1 mt-1 border-l border-white/10 pl-2">
                      {item.subItems!.map((child) => {
                        const ChildIcon = child.icon!;
                        const childActive = isActive(child.href!);
                        return (
                          <button
                            key={child.href}
                            onClick={() => router.push(child.href!)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                              childActive
                                ? "bg-[rgba(198,154,76,0.15)] text-[color:var(--brass)]"
                                : "text-[color:var(--ledger-paper-dim)] hover:bg-[rgba(244,239,223,0.06)] hover:text-[color:var(--ledger-paper)]"
                            }`}
                          >
                            <ChildIcon className={`h-4 w-4 shrink-0 ${childActive ? "text-[color:var(--brass)]" : ""}`} />
                            <span className="text-[13px] font-medium">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal single item
            const active = isActive(item.href!);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href!)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                  active
                    ? "bg-[rgba(198,154,76,0.15)] text-[color:var(--brass)]"
                    : "text-[color:var(--ledger-paper-dim)] hover:bg-[rgba(244,239,223,0.06)] hover:text-[color:var(--ledger-paper)]"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? "text-[color:var(--brass)]" : ""}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto border-t border-[color:var(--line)] pt-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[color:var(--ledger-paper-dim)] transition-all hover:bg-[rgba(244,239,223,0.06)] hover:text-[color:var(--ledger-paper)]"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default VaultSidebar;
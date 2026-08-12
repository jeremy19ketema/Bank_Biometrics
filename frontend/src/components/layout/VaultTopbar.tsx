"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

type UserRole = "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER" | "SUPER_ADMIN_IT" | "SUPER_ADMIN_FOREX" | "BANK_MANAGER" | "BRANCH_IT" | "ACCOUNTANT";

const roleLabels: Record<string, string> = {
  "super-admin": "Super Admin",
  "internal-manager": "Super Admin Manager",
  it: "IT Operations",
  forex: "FOREX Operations",
  manager: "Bank Manager",
  accountant: "Accountant",
  branches: "Branch Management",
  transactions: "Transactions",
  accountants: "Accountants",
  customers: "Customers",
  biometrics: "Biometrics",
  approvals: "Approvals",
  reports: "Reports",
  settings: "Settings",
  "it-users": "IT Users",
};

export default function VaultTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("aegis_user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.fullName || user.username);
      }
    } catch {}
  }, []);

  const handleSignOut = () => {
    // Clear session storage
    sessionStorage.removeItem("aegis_user");
    // Clear cookies (the middleware uses these)
    document.cookie = "aegis_auth_token=; path=/; max-age=0";
    document.cookie = "aegis_user=; path=/; max-age=0";
    // Redirect to login
    router.push("/login");
  };

  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments.length > 0 ? roleLabels[segments[0]] || segments[0] : "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb">
          <span className="crumb">AEGIS</span>
          {segments.map((seg, i) => (
            <React.Fragment key={seg}>
              <span className="sep">/</span>
              <span className={`crumb ${i === segments.length - 1 ? "current" : ""}`}>
                {roleLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")}
              </span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
          {currentPage}
        </h1>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search operations..." />
        </div>
        <div className="topbar-user">
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="leading-tight">
            <div className="user-name">{userName}</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ledger-paper-dim)]">Secure access</div>
          </div>
        </div>
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(168,69,46,0.1)] border border-[color:var(--clay)]/30 text-[color:var(--clay)] hover:bg-[rgba(168,69,46,0.2)] transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
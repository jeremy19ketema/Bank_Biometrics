"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [timestamp, setTimestamp] = useState("");
  const [dashboardPath, setDashboardPath] = useState("/super-admin");

  useEffect(() => {
    setTimestamp(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");

    // Get user role from sessionStorage
    try {
      const stored = sessionStorage.getItem("aegis_user");
      if (stored) {
        const user = JSON.parse(stored);
        const roleMap: Record<string, string> = {
          SUPER_ADMIN: "/super-admin",
          SUPER_ADMIN_MANAGER: "/internal-manager",
          SUPER_ADMIN_IT: "/it",
          SUPER_ADMIN_FOREX: "/forex",
          BANK_MANAGER: "/manager",
          BRANCH_IT: "/it",
          IT_SUPPORT: "/it",
          ACCOUNTANT: "/accountant",
        };
        setDashboardPath(roleMap[user.role] || "/super-admin");
      }
    } catch {
      // Fallback to super-admin
      setDashboardPath("/super-admin");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--ink-navy)]">
      {/* Top strip */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[color:var(--line-strong)] bg-[rgba(15,27,43,0.92)]">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] border-[1.5px] border-[color:var(--brass)] rounded-full flex items-center justify-center text-[color:var(--brass)] font-display text-[17px]">
            A
          </div>
          <span className="font-mono tracking-[0.18em] text-[12px] text-[color:var(--ledger-paper-dim)]">
            AEGIS &nbsp;·&nbsp; BIOMETRIC BANKING
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="relative bg-[color:var(--vault-charcoal)] border border-[color:var(--line-strong)] rounded-md p-12 w-full max-w-[560px] text-center">
          {/* Top accent line */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[color:var(--brass)] to-transparent" />

          <div className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--brass)] uppercase">
            Ledger lookup failed
          </div>

          {/* Dial with 404 code */}
          <div className="flex justify-center my-6">
            <div className="relative inline-flex items-center justify-center w-[104px] h-[104px]">
              <svg className="rotate-[-90deg]" width="104" height="104" viewBox="0 0 104 104">
                <circle className="track" cx="52" cy="52" r="44" strokeWidth="5" fill="none" stroke="var(--line-strong)" />
                <circle
                  className="arc"
                  cx="52"
                  cy="52"
                  r="44"
                  strokeWidth="5"
                  fill="none"
                  stroke="var(--clay)"
                  strokeDasharray="276.5"
                  strokeDashoffset="180"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[26px] font-semibold text-[color:var(--ledger-paper)] tracking-wide">404</span>
              </div>
            </div>
          </div>

          <h1 className="font-display font-medium text-[26px] text-[color:var(--ledger-paper)] mt-4">
            This entry isn't in the ledger
          </h1>
          <p className="text-[14px] text-[color:var(--ledger-paper-dim)] leading-relaxed max-w-[400px] mx-auto my-4">
            The page, branch record, or reference you requested couldn't be located. It may have been moved, archived, or the reference number was mistyped.
          </p>

          {/* Meta row */}
          <div className="flex justify-center gap-7 py-4 my-6 border-y border-[color:var(--line)]">
            <div className="font-mono">
              <div className="text-[13px] text-[color:var(--ledger-paper)]">404</div>
              <div className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-[0.08em] mt-1">Status</div>
            </div>
            <div className="font-mono">
              <div className="text-[13px] text-[color:var(--ledger-paper)]">{timestamp}</div>
              <div className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-[0.08em] mt-1">Timestamp</div>
            </div>
            <div className="font-mono">
              <div className="text-[13px] text-[color:var(--ledger-paper)]">NOT-FOUND</div>
              <div className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-[0.08em] mt-1">Reference</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href={dashboardPath} className="bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-semibold text-[14px] px-6 py-3 rounded-sm transition-colors no-underline">
              Return to Dashboard
            </Link>
            <button
              onClick={() => history.back()}
              className="bg-transparent border border-[color:var(--line-strong)] text-[color:var(--ledger-paper-dim)] hover:border-[color:var(--brass)] hover:text-[color:var(--ledger-paper)] text-[14px] px-6 py-3 rounded-sm transition-colors cursor-pointer"
            >
              Go back
            </button>
          </div>

          <div className="mt-5 font-mono text-[11px] text-[color:var(--ledger-paper-dim)]">
            If you believe this is an error, contact your branch administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Fingerprint, ShieldCheck, LockKeyhole, UserRound, ArrowRight, Loader2 } from "lucide-react";
import { getStoredUser, setAuthSession, ROLE_ROUTES, AuthUser } from "@/lib/auth";
import { UserRole } from "@/types";

export default function ChangeCredentialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setNewUsername(stored.username || "");
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (newPasscode.length < 6) {
      setErrorMsg("New passcode must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setErrorMsg("Passcodes do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: newUsername !== user?.username ? newUsername : undefined,
          currentPasscode,
          newPasscode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token && data.user) {
          setAuthSession(data.user);
        }

        setSuccessMsg("Credentials updated successfully! Redirecting to dashboard...");

        const role = data.user?.role || user?.role || "ACCOUNTANT";
        const dashboardRoute = ROLE_ROUTES[role as UserRole] || "/super-admin";

        setTimeout(() => {
          router.push(dashboardRoute);
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to update credentials. Please try again.");
      }
    } catch {
      setErrorMsg("Service unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(198,154,76,0.16),_transparent_30%),linear-gradient(135deg,_#07111d,_#0f1728)] px-4 py-8 text-[color:var(--ledger-paper)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="flex-1 rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.34)] backdrop-blur-xl lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brass)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure onboarding
          </div>
          <div className="mt-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)]">
            <Fingerprint className="h-8 w-8 text-[color:var(--brass)]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, {user.fullName}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--ledger-paper-dim)] sm:text-base">
            This is your first login, so you must update your temporary credentials before entering the secure operating environment.
          </p>

          <div className="mt-8 grid gap-3 rounded-[24px] border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ledger-paper-dim)]">Role</div>
              <div className="mt-1 font-semibold">{user.role || "Access User"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ledger-paper-dim)]">Status</div>
              <div className="mt-1 font-semibold text-[color:var(--moss)]">Pending activation</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ledger-paper-dim)]">Access level</div>
              <div className="mt-1 font-semibold">Protected</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.9)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.34)] backdrop-blur-xl sm:p-8">
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-[color:var(--clay)]/30 bg-[rgba(168,69,46,0.16)] p-3 text-sm text-[color:var(--clay)]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-2xl border border-[color:var(--moss)]/30 bg-[rgba(76,122,94,0.16)] p-3 text-sm text-[color:var(--moss)]">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--ledger-paper-dim)]" htmlFor="newUsername">
                Username
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] px-3 py-3 transition focus-within:border-[color:var(--brass)] focus-within:ring-2 focus-within:ring-[rgba(198,154,76,0.18)]">
                <UserRound className="h-4 w-4 text-[color:var(--ledger-paper-dim)]" />
                <input
                  className="w-full border-none bg-transparent text-sm text-[color:var(--ledger-paper)] outline-none placeholder:text-[color:var(--ledger-paper-dim)]"
                  id="newUsername"
                  placeholder="Enter your new username"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--ledger-paper-dim)]" htmlFor="currentPasscode">
                Current temporary passcode
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] px-3 py-3 transition focus-within:border-[color:var(--brass)] focus-within:ring-2 focus-within:ring-[rgba(198,154,76,0.18)]">
                <LockKeyhole className="h-4 w-4 text-[color:var(--ledger-paper-dim)]" />
                <input
                  className="w-full border-none bg-transparent text-sm text-[color:var(--ledger-paper)] outline-none placeholder:text-[color:var(--ledger-paper-dim)]"
                  id="currentPasscode"
                  placeholder="Enter temporary passcode"
                  type={showPassword ? "text" : "password"}
                  required
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--ledger-paper-dim)]" htmlFor="newPasscode">
                New passcode
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] px-3 py-3 transition focus-within:border-[color:var(--brass)] focus-within:ring-2 focus-within:ring-[rgba(198,154,76,0.18)]">
                <LockKeyhole className="h-4 w-4 text-[color:var(--ledger-paper-dim)]" />
                <input
                  className="w-full border-none bg-transparent text-sm text-[color:var(--ledger-paper)] outline-none placeholder:text-[color:var(--ledger-paper-dim)]"
                  id="newPasscode"
                  placeholder="Enter new passcode (min 6 chars)"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--ledger-paper-dim)]" htmlFor="confirmPasscode">
                Confirm new passcode
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] px-3 py-3 transition focus-within:border-[color:var(--brass)] focus-within:ring-2 focus-within:ring-[rgba(198,154,76,0.18)]">
                <LockKeyhole className="h-4 w-4 text-[color:var(--ledger-paper-dim)]" />
                <input
                  className="w-full border-none bg-transparent text-sm text-[color:var(--ledger-paper)] outline-none placeholder:text-[color:var(--ledger-paper-dim)]"
                  id="confirmPasscode"
                  placeholder="Re-enter new passcode"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.03)] px-3 py-3 text-sm text-[color:var(--ledger-paper-dim)]">
              <label htmlFor="showPassword" className="flex cursor-pointer items-center gap-2">
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Show passcodes</span>
              </label>
              <input
                type="checkbox"
                id="showPassword"
                className="h-4 w-4 rounded border-white/10 bg-transparent accent-[color:var(--brass)]"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_var(--brass),_#e0b86e)] px-4 py-3 text-sm font-semibold text-[color:var(--ink-navy)] transition hover:translate-y-[-1px] hover:shadow-[0_12px_24px_rgba(198,154,76,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating credentials...
                </>
              ) : successMsg ? (
                <>
                  Redirecting
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Update credentials
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.03)] p-3 text-sm text-[color:var(--ledger-paper-dim)]">
            You will be redirected to the correct dashboard after your credentials are updated.
          </div>
        </div>
      </div>
    </div>
  );
}

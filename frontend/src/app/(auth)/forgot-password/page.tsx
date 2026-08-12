"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    setTimeout(() => {
      if (identifier.toLowerCase().includes("error") || !identifier.trim()) {
        setStatus("error");
      } else {
        setStatus("success");
      }
    }, 1200);
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col items-center justify-center p-gutter relative font-body-md text-body-md text-on-surface antialiased overflow-hidden w-full">
      {/* Decorative Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-surface-container to-transparent pointer-events-none opacity-50"></div>

      {/* Main Content Canvas */}
      <main className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl border border-outline-variant p-xl relative z-10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
        {/* Identity / Header */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center mb-lg shadow-sm">
            <span
              className="material-symbols-outlined text-primary text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock_reset
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs text-center">
            Forgot Password
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-[300px]">
            Secure identity recovery for your Aegis Biometric environment.
          </p>
        </div>

        {/* Info State */}
        {status === "idle" && (
          <div className="bg-surface border border-outline-variant rounded-lg p-md mb-xl flex items-start gap-md">
            <span className="material-symbols-outlined text-primary mt-[2px] text-[20px]">info</span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Enter your registered username or email. A password reset link will be sent securely.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-md mb-xl flex items-start gap-md">
            <span className="material-symbols-outlined text-secondary mt-[2px] text-[20px]">
              check_circle
            </span>
            <p className="font-body-md text-body-md text-on-surface">
              <strong>Password reset email sent successfully.</strong>
              <br />
              <span className="text-on-surface-variant">
                Please check your inbox and follow the secure link.
              </span>
            </p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="bg-error-container border border-error/30 rounded-lg p-md mb-xl flex items-start gap-md">
            <span className="material-symbols-outlined text-error mt-[2px] text-[20px]">error</span>
            <p className="font-body-md text-body-md text-on-error-container">
              <strong>User not found.</strong>
              <br />
              <span className="opacity-80">
                We could not locate an account matching that identifier. Please verify and try again.
              </span>
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="identifier">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">
                person
              </span>
              <input
                className="w-full h-[44px] pl-[44px] pr-md bg-surface-container-lowest border border-outline-variant rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-lg font-body-lg text-on-surface placeholder:text-outline transition-all duration-200"
                id="identifier"
                name="identifier"
                placeholder="Enter your registered identifier"
                required
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
              />
            </div>
          </div>

          <button
            className="h-[44px] w-full bg-primary text-on-primary font-label-md text-label-md rounded-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-sm mt-xs shadow-sm relative overflow-hidden group disabled:opacity-80"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <>
                <span>Continue</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Secondary Action */}
        <div className="mt-xl pt-lg border-t border-outline-variant flex justify-center">
          <Link
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary flex items-center gap-xs transition-colors group"
            href="/login"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform duration-200 text-[18px]">
              arrow_back
            </span>
            Back to Login
          </Link>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="mt-xl text-center font-label-sm text-label-sm text-outline relative z-10">
        © 2026 Aegis Biometric Systems. <br className="md:hidden" />
        Secure Infrastructure.
      </footer>
    </div>
  );
}


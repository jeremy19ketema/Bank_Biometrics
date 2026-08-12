"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // ---- Step state ----
  const [step, setStep] = useState(1);

  // ---- Credentials ----
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ staffId: false, password: false });

  // ---- Biometric ----
  const [bioProgress, setBioProgress] = useState(0);
  const [bioStatus, setBioStatus] = useState("Initializing sensor…");
  const [bioSubStatus, setBioSubStatus] = useState("Do not remove your finger from the scanner.");

  // ---- Success ----
  const [sessionToken, setSessionToken] = useState("");
  const [redirectCount, setRedirectCount] = useState(3);
  const [userName, setUserName] = useState("User");

  // ---- Live feed and counter ----
  const [scanCounter, setScanCounter] = useState(45900);
  const [feed, setFeed] = useState<{ loc: string; res: string; time: string }[]>([]);
  const feedTemplates = [
    ["BR-NY-04 — Midtown", "Fingerprint match · 99.4%"],
    ["BR-SG-02 — Raffles Place", "Facial scan · 98.9%"],
    ["BR-HK-01 — Central", "Fingerprint match · 99.8%"],
    ["BR-BER-01 — Mitte", "Passkey verified"],
    ["BR-LDN-03 — Canary Wharf", "Fingerprint match · 99.1%"],
    ["BR-NY-04 — Midtown", "Facial scan · 97.6%"],
  ];
  const feedIdx = useRef(0);

  // ---- Clock ----
  const [clock, setClock] = useState("");

  // ---- Refs ----
  const bioInterval = useRef<NodeJS.Timeout | null>(null);
  const redirectInterval = useRef<NodeJS.Timeout | null>(null);

  // ---- Effects ----
  useEffect(() => {
    // Clock update
    const updateClock = () => {
      const d = new Date();
      setClock(d.toISOString().replace("T", " ").slice(0, 19) + " UTC");
    };
    updateClock();
    const clockInt = setInterval(updateClock, 1000);

    // Scan counter increment
    const counterInt = setInterval(() => {
      setScanCounter((prev) => prev + Math.floor(Math.random() * 4) + 1);
    }, 4000);

    // Live feed
    const addFeedItem = () => {
      const [loc, res] = feedTemplates[feedIdx.current % feedTemplates.length];
      feedIdx.current++;
      const time = new Date().toISOString().slice(11, 19);
      setFeed((prev) => {
        const newFeed = [{ loc, res, time }, ...prev];
        if (newFeed.length > 4) newFeed.pop();
        return newFeed;
      });
    };
    addFeedItem();
    const feedInt = setInterval(addFeedItem, 3200);

    return () => {
      clearInterval(clockInt);
      clearInterval(counterInt);
      clearInterval(feedInt);
      if (bioInterval.current) clearInterval(bioInterval.current);
      if (redirectInterval.current) clearInterval(redirectInterval.current);
    };
  }, []);

  // ---- Navigation ----
  const goToStep = (target: number) => {
    setStep(target);
    if (target === 2) startBiometricScan();
    if (target === 3) startRedirect();
  };

  // ---- Submit credentials ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    let hasError = false;
    const newErrors = { staffId: false, password: false };
    if (staffId.trim().length < 3) {
      newErrors.staffId = true;
      hasError = true;
    }
    if (password.trim().length < 4) {
      newErrors.password = true;
      hasError = true;
    }
    setFieldErrors(newErrors);
    if (hasError) {
      setAttempts((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: staffId, passcode: password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        sessionStorage.setItem("aegis_user", JSON.stringify(data.user));
        setUserName(data.user.fullName || data.user.username);
        setIsLoading(false);
        goToStep(2);
      } else {
        setIsLoading(false);
        setErrorMsg(data.message || "Invalid credentials.");
        setAttempts((prev) => prev + 1);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Authentication service unavailable.");
    }
  };

  // ---- Biometric scan ----
  const startBiometricScan = () => {
    setBioProgress(0);
    setBioStatus("Initializing sensor…");
    setBioSubStatus("Do not remove your finger from the scanner.");

    const circumference = 414.7;
    const duration = 2600;
    const startTime = Date.now();

    if (bioInterval.current) clearInterval(bioInterval.current);
    bioInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(1, elapsed / duration);
      setBioProgress(pct * 100);

      // Update status messages
      if (pct < 0.15) setBioStatus("Initializing sensor…");
      else if (pct < 0.45) setBioStatus("Capturing ridge pattern…");
      else if (pct < 0.75) setBioStatus("Cross-referencing enrollment record…");
      else if (pct < 0.95) setBioStatus("Matching confidence rising…");
      else setBioStatus("Finalizing verification…");

      if (pct >= 1) {
        clearInterval(bioInterval.current!);
        setBioStatus("Match confirmed · 99.7%");
        setBioSubStatus("Identity verified successfully.");
        setTimeout(() => goToStep(3), 500);
      }
    }, 30);
  };

  // ---- Redirect countdown ----
  const startRedirect = () => {
    setSessionToken("sess_" + Math.random().toString(36).slice(2, 10));
    let count = 3;
    setRedirectCount(count);
    if (redirectInterval.current) clearInterval(redirectInterval.current);
    redirectInterval.current = setInterval(() => {
      count--;
      setRedirectCount(count);
      if (count <= 0) {
        clearInterval(redirectInterval.current!);
        // Redirect based on role
        const user = JSON.parse(sessionStorage.getItem("aegis_user") || "{}");
        const roleMap: Record<string, string> = {
          SUPER_ADMIN: "/super-admin",
          SUPER_ADMIN_MANAGER: "/internal-manager",
          SUPER_ADMIN_IT: "/it",
          SUPER_ADMIN_FOREX: "/forex",
          BANK_MANAGER: "/manager",
          BRANCH_IT: "/it",
          ACCOUNTANT: "/accountant",
        };
        const redirectPath = roleMap[user.role] || "/super-admin";
        router.push(redirectPath);
      }
    }, 1000);
  };

  // ---- Helper ----
  const getSegClass = (segIdx: number) => {
    if (segIdx < step) return "seg done";
    if (segIdx === step) return "seg active";
    return "seg";
  };

  return (
    <div className="shell">
      {/* LEFT PANEL */}
      <div className="left">
        <div className="scan-grid"></div>
        <div className="scan-line"></div>

        <div className="brand-mark">
          <div className="glyph">A</div>
          <span>AEGIS · BIOMETRIC BANKING</span>
        </div>

        <div className="hero">
          <h1>
            Every transaction,<br />
            <em>verified</em> at the source.
          </h1>
          <p>
            Fingerprint and facial verification for high-value banking operations across 142 branches.
            Access is logged, timestamped, and reconciled to the second.
          </p>

          <div className="live-feed">
            <div className="lf-title">
              <div className="dot"></div>
              LIVE VERIFICATION LOG
            </div>
            <div id="feed-list">
              {feed.map((item, idx) => (
                <div key={idx} className="feed-item">
                  <span className="fi-loc">{item.loc}</span>
                  <span>
                    {item.res} · {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stat-row">
          <div>
            <div className="n">99.94%</div>
            <div className="c">Match accuracy</div>
          </div>
          <div>
            <div className="n">142</div>
            <div className="c">Branches live</div>
          </div>
          <div>
            <div className="n">{scanCounter.toLocaleString()}</div>
            <div className="c">Scans today</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right">
        <div className="form-box">
          <div className="top-meta">
            <span className="kicker">Restricted access</span>
            <span className="clock">{clock}</span>
          </div>

          {/* Step tracker */}
          <div className="step-track">
            <div className={getSegClass(1)}>
              <div className="fill"></div>
            </div>
            <div className={getSegClass(2)}>
              <div className="fill"></div>
            </div>
            <div className={getSegClass(3)}>
              <div className="fill"></div>
            </div>
          </div>

          {/* STEP 1: Credentials */}
          {step === 1 && (
            <div className="step active">
              <div className="panel-title display">Sign in to your desk</div>
              <div className="panel-sub">Enter your staff credentials to begin verification.</div>

              {attempts > 0 && (
                <div className="attempts-note show">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                  </svg>
                  <span>
                    {attempts} failed attempt{attempts > 1 ? "s" : ""} · {Math.max(0, 3 - attempts)} remaining before lockout
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="err-msg show" style={{ marginBottom: "12px" }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Staff ID</label>
                  <input
                    type="text"
                    placeholder="e.g. superadmin"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className={fieldErrors.staffId ? "error" : ""}
                  />
                  {fieldErrors.staffId && <div className="err-msg show">Staff ID not recognized.</div>}
                </div>

                <div className="field">
                  <label>
                    Password
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Forgot?
                    </a>
                  </label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={fieldErrors.password ? "error" : ""}
                    />
                    <div className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                  {fieldErrors.password && <div className="err-msg show">Incorrect password.</div>}
                </div>

                <div className="remember-row">
                  <div className="remember">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <label htmlFor="remember">Remember this device</label>
                  </div>
                  <span className="mono" style={{ fontSize: "11px", color: "var(--ledger-paper-dim)" }}>
                    30 days
                  </span>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  <span>{isLoading ? "Verifying…" : "Continue"}</span>
                  {isLoading && <span className="spinner show"></span>}
                </button>
              </form>

              <div className="divider">
                <span>OR VERIFY WITH</span>
              </div>

              <div className="method-row">
                <button className="method-btn" onClick={() => goToStep(2)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M7 11a5 5 0 0110 0v2a8 8 0 01-1.5 4.5M12 11v3a3 3 0 01-1 2.2" />
                  </svg>
                  Fingerprint
                </button>
                <button className="method-btn" onClick={() => goToStep(2)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M15 8v4M17 10h-4" />
                  </svg>
                  Passkey
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Biometric */}
          {step === 2 && (
            <div className="step active">
              <div className="panel-title display">Verifying identity</div>
              <div className="panel-sub">Hold still — matching against your enrolled biometric reference.</div>

              <div className="bio-stage">
                <div className="bio-ring-wrap">
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle
                      className="bio-track"
                      cx="75"
                      cy="75"
                      r="66"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      className="bio-progress"
                      cx="75"
                      cy="75"
                      r="66"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="414.7"
                      strokeDashoffset={414.7 * (1 - bioProgress / 100)}
                      style={{ transition: "stroke-dashoffset 0.05s linear" }}
                    />
                  </svg>
                  <div className="bio-center">
                    <svg
                      className="fingerprint-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <path d="M12 2a7 7 0 00-7 7c0 4 2 5 2 9" />
                      <path d="M12 2a7 7 0 017 7c0 1.5-.2 2.6-.5 3.6" />
                      <path d="M8 21a15 15 0 01-1-6 5 5 0 0110 0c0 1 0 2-.3 3.2" />
                      <path d="M12 21a10 10 0 00.6-3 3.5 3.5 0 00-7 0" />
                      <path d="M16 21a12 12 0 001-5" />
                    </svg>
                  </div>
                </div>
                <div className="bio-status mono">{bioStatus}</div>
                <div className="bio-substatus">{bioSubStatus}</div>
              </div>

              <button className="btn-ghost" onClick={() => goToStep(1)}>
                Cancel and go back
              </button>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="step active">
              <div className="success-stage">
                <div className="check-circle">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="panel-title display" style={{ fontSize: "22px" }}>
                  Identity confirmed
                </div>
                <div className="panel-sub" style={{ marginBottom: 0 }}>
                  Welcome back, {userName}. Redirecting to your desk.
                </div>

                <div className="session-card">
                  <div className="session-row">
                    <span className="k">Staff ID</span>
                    <span className="v">{staffId}</span>
                  </div>
                  <div className="session-row">
                    <span className="k">Branch</span>
                    <span className="v">BR-NY-04 — Midtown</span>
                  </div>
                  <div className="session-row">
                    <span className="k">Match confidence</span>
                    <span className="v" style={{ color: "var(--moss)" }}>
                      99.7%
                    </span>
                  </div>
                  <div className="session-row">
                    <span className="k">Session token</span>
                    <span className="v">{sessionToken}</span>
                  </div>
                </div>

                <div className="redirect-note">
                  Redirecting in <b>{redirectCount}</b>s…
                </div>
              </div>
            </div>
          )}

          <div className="footer-meta">
            <span>AEGIS · v3.2.1</span>
            <span>FIPS 140-3 Level 4</span>
            <span>IP 10.42.6.118</span>
          </div>
        </div>
      </div>

      {/* Inline styles for the advanced login design */}
      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          height: 100vh;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .shell {
            grid-template-columns: 1fr;
          }
          .left {
            display: none;
          }
        }

        .left {
          position: relative;
          padding: 48px 64px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(circle at 20% 15%, rgba(198, 154, 76, 0.07), transparent 45%),
            radial-gradient(circle at 80% 85%, rgba(76, 122, 94, 0.06), transparent 45%),
            var(--ink-navy);
          overflow: hidden;
          border-right: 1px solid var(--line);
        }
        .scan-grid {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          background-image: linear-gradient(rgba(198, 154, 76, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(198, 154, 76, 0.05) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 30% 30%, black, transparent 70%);
        }
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(180deg, transparent, rgba(198, 154, 76, 0.06), transparent);
          animation: sweep 7s linear infinite;
        }
        @keyframes sweep {
          0% {
            top: -120px;
          }
          100% {
            top: 100%;
          }
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }
        .brand-mark .glyph {
          width: 34px;
          height: 34px;
          border: 1.5px solid var(--brass);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brass);
          font-family: "Fraunces", serif;
          font-size: 17px;
        }
        .brand-mark span {
          font-family: "IBM Plex Mono", monospace;
          letter-spacing: 0.18em;
          font-size: 12px;
          color: var(--ledger-paper-dim);
        }

        .hero {
          position: relative;
          z-index: 2;
          max-width: 560px;
        }
        .hero h1 {
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 44px;
          line-height: 1.12;
          margin-bottom: 18px;
        }
        .hero h1 em {
          font-style: italic;
          color: var(--brass);
        }
        .hero p {
          font-size: 14px;
          color: var(--ledger-paper-dim);
          line-height: 1.7;
          max-width: 440px;
        }

        .live-feed {
          position: relative;
          z-index: 2;
          margin-top: 28px;
          border-top: 1px solid var(--line);
          padding-top: 16px;
          max-width: 460px;
        }
        .lf-title {
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--ledger-paper-dim);
          text-transform: uppercase;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lf-title .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--moss);
          box-shadow: 0 0 6px var(--moss);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .feed-item {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: var(--ledger-paper-dim);
          padding: 5px 0;
          display: flex;
          justify-content: space-between;
          opacity: 1;
        }
        .feed-item .fi-loc {
          color: var(--ledger-paper);
        }

        .stat-row {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 48px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }
        .stat-row div {
          font-family: "IBM Plex Mono", monospace;
        }
        .stat-row .n {
          font-size: 22px;
          color: var(--brass);
        }
        .stat-row .c {
          font-size: 10px;
          color: var(--ledger-paper-dim);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }

        .right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          position: relative;
          background: var(--ink-navy);
        }
        .right::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            135deg,
            rgba(198, 154, 76, 0.02) 0px,
            rgba(198, 154, 76, 0.02) 1px,
            transparent 1px,
            transparent 48px
          );
        }
        .form-box {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 400px;
        }

        .top-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }
        .kicker {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          color: var(--brass);
          text-transform: uppercase;
        }
        .clock {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: var(--ledger-paper-dim);
        }

        .step-track {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 26px;
        }
        .step-track .seg {
          flex: 1;
          height: 2px;
          background: var(--line-strong);
          border-radius: 2px;
          overflow: hidden;
        }
        .step-track .seg .fill {
          height: 100%;
          width: 0%;
          background: var(--brass);
          transition: width 0.5s ease;
        }
        .step-track .seg.done .fill {
          width: 100%;
        }
        .step-track .seg.active .fill {
          width: 50%;
        }

        .panel-title {
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 26px;
          margin-bottom: 6px;
        }
        .panel-sub {
          font-size: 13px;
          color: var(--ledger-paper-dim);
          margin-bottom: 26px;
          line-height: 1.5;
        }

        .step {
          display: none;
        }
        .step.active {
          display: block;
          animation: stepIn 0.35s ease;
        }
        @keyframes stepIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .field {
          margin-bottom: 18px;
        }
        .field label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--ledger-paper-dim);
          margin-bottom: 6px;
        }
        .field label a {
          color: var(--brass-dim);
          text-decoration: none;
          font-size: 11px;
        }
        .field label a:hover {
          color: var(--brass);
        }
        .input-wrap {
          position: relative;
        }
        .field input {
          width: 100%;
          background: var(--vault-charcoal-2);
          border: 1px solid var(--line-strong);
          color: var(--ledger-paper);
          padding: 13px 14px;
          border-radius: 2px;
          font-size: 14px;
          font-family: "IBM Plex Mono", monospace;
          outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus {
          border-color: var(--brass);
        }
        .field input.error {
          border-color: var(--clay);
        }
        .toggle-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: var(--ledger-paper-dim);
          display: flex;
        }
        .toggle-eye:hover {
          color: var(--brass);
        }
        .toggle-eye svg {
          width: 16px;
          height: 16px;
        }
        .err-msg {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: var(--clay);
          margin-top: 6px;
          display: none;
        }
        .err-msg.show {
          display: block;
        }

        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 20px 0;
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .remember input {
          accent-color: var(--brass);
        }
        .remember label {
          font-size: 12px;
          color: var(--ledger-paper-dim);
        }

        .attempts-note {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: var(--brass);
          margin-bottom: 16px;
          display: none;
          align-items: center;
          gap: 6px;
        }
        .attempts-note.show {
          display: flex;
        }

        .btn-primary {
          width: 100%;
          background: var(--brass);
          color: var(--ink-navy);
          border: none;
          padding: 14px 26px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 2px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.2s;
          font-family: "IBM Plex Sans", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover {
          background: #d7ab5c;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-ghost {
          width: 100%;
          background: transparent;
          color: var(--ledger-paper-dim);
          border: 1px solid var(--line-strong);
          padding: 13px 26px;
          font-size: 13px;
          border-radius: 2px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: all 0.2s;
          margin-top: 10px;
          font-family: "IBM Plex Sans", sans-serif;
        }
        .btn-ghost:hover {
          border-color: var(--brass);
          color: var(--ledger-paper);
        }

        .spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(15, 27, 43, 0.3);
          border-top-color: var(--ink-navy);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: none;
        }
        .spinner.show {
          display: inline-block;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line-strong);
        }
        .divider span {
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          color: var(--ledger-paper-dim);
          letter-spacing: 0.1em;
        }

        .method-row {
          display: flex;
          gap: 10px;
        }
        .method-btn {
          flex: 1;
          border: 1px solid var(--line-strong);
          background: transparent;
          border-radius: 3px;
          padding: 11px;
          cursor: pointer;
          color: var(--ledger-paper-dim);
          font-size: 12px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: "IBM Plex Sans", sans-serif;
        }
        .method-btn:hover {
          border-color: var(--brass);
          color: var(--ledger-paper);
        }
        .method-btn svg {
          width: 15px;
          height: 15px;
        }

        .bio-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px 0 6px;
        }
        .bio-ring-wrap {
          position: relative;
          width: 150px;
          height: 150px;
          margin-bottom: 24px;
        }
        .bio-ring-wrap svg {
          transform: rotate(-90deg);
        }
        .bio-track {
          stroke: var(--line-strong);
          fill: none;
        }
        .bio-progress {
          stroke: var(--brass);
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.1s linear;
        }
        .bio-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fingerprint-icon {
          width: 52px;
          height: 52px;
          color: var(--brass);
          animation: fpPulse 1.6s ease-in-out infinite;
        }
        @keyframes fpPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        .bio-status {
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          color: var(--ledger-paper-dim);
          letter-spacing: 0.05em;
          min-height: 18px;
        }
        .bio-substatus {
          font-size: 12px;
          color: var(--ledger-paper-dim);
          margin-top: 6px;
          max-width: 300px;
        }

        .success-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px 0;
        }
        .check-circle {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          border: 2px solid var(--moss);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          box-shadow: 0 0 24px rgba(76, 122, 94, 0.25);
        }
        .check-circle svg {
          width: 32px;
          height: 32px;
          stroke: var(--moss);
        }
        .session-card {
          width: 100%;
          background: var(--vault-charcoal);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 18px 20px;
          margin-top: 22px;
          text-align: left;
        }
        .session-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--line);
          font-size: 12px;
        }
        .session-row:last-child {
          border-bottom: none;
        }
        .session-row .k {
          color: var(--ledger-paper-dim);
        }
        .session-row .v {
          font-family: "IBM Plex Mono", monospace;
        }
        .redirect-note {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: var(--ledger-paper-dim);
          margin-top: 18px;
        }
        .redirect-note b {
          color: var(--brass);
        }

        .footer-meta {
          text-align: center;
          margin-top: 28px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          color: var(--ledger-paper-dim);
          letter-spacing: 0.04em;
        }
        .footer-meta span {
          margin: 0 8px;
        }
      `}</style>
    </div>
  );
}
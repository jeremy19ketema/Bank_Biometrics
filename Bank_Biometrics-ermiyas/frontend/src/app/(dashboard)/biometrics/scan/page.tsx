"use client";

import { useEffect, useState, useCallback } from "react";

export default function BiometricScanPage() {
  const [percentage, setPercentage] = useState(0);
  const [statusText, setStatusText] = useState("Awaiting contact...");

  const circumference = 402.1;

  const startScan = useCallback(() => {
    setPercentage(0);
    setStatusText("Awaiting contact...");

    let current = 0;
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        current += 4;
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
          setStatusText("Match confirmed");
        } else if (current > 20) {
          setStatusText("Reading ridge pattern...");
        }
        setPercentage(current);
      }, 90);
    }, 400);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    startScan();
  }, [startScan]);

  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <div className="scan-wrap">
      <div className="scan-card">
        <div className="kicker">Capture in progress</div>
        <h2 className="display">Biometric template</h2>
        <p>
          Place customer&apos;s right index finger firmly on the optical sensor window until the dial completes.
        </p>

        <div className="vault-dial cursor-pointer" style={{ width: "150px", height: "150px" }} onClick={startScan} title="Click to restart scan">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle className="track" cx="75" cy="75" r="64" strokeWidth="6" />
            <circle
              className="arc"
              cx="75"
              cy="75"
              r="64"
              strokeWidth="6"
              strokeDasharray="402.1"
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
          <div className="center">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C69A4C" strokeWidth="1.5">
              <path d="M7 11a5 5 0 0110 0v2a8 8 0 01-1.5 4.5M12 11v3a3 3 0 01-1 2.2M9 11v4a6 6 0 001 3.3M4.8 15.5A9 9 0 014 12a8 8 0 0114.5-4.7M17.5 6.5A9 9 0 0121 12c0 .8-.07 1.5-.2 2.2" />
            </svg>
            <div className="mono" style={{ fontSize: "15px", marginTop: "6px", color: "#EDE7D9" }}>
              {percentage}%
            </div>
          </div>
        </div>

        <div className="scan-status">
          <span>{statusText}</span>
        </div>

        <div className="mt-4">
          <button className="btn-mini hover:border-[#C69A4C] hover:text-[#C69A4C] transition-colors" onClick={startScan}>
            Restart Capture
          </button>
        </div>

        <div className="scan-meta">
          <span>Sensor: OPT-04B</span>
          <span>HSM: synced</span>
        </div>
      </div>
    </div>
  );
}
/**
 * Demo-only switch for classroom walkthroughs when scanner hardware and its
 * vendor SDK are unavailable. It must never enable biometric bypasses in a
 * production environment.
 */
export function isDemoBiometricBypassEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.BIOMETRIC_DEMO_BYPASS === "true";
}

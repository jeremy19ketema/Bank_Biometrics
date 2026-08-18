import { IBiometricProvider, ScanVerificationResult } from "./IBiometricProvider.js";

/**
 * HARDWARE BIOMETRIC PROVIDER PLACEHOLDER
 * 
 * Target Architecture:
 * - This backend service will communicate with a secured LOCAL DAEMON / REST service 
 *   running on the teller workstation (e.g., https://localhost:8443/biometrics).
 * - We do NOT load native vendor libraries (DLLs) directly into this Node.js process 
 *   since many fingerprint SDKs are tied to Windows hardware limits.
 * 
 * Required Integrations (To be filled when SDK is supplied):
 * - Device certificate validation/pinning.
 * - Request nonce generation & replay protection.
 * - Mutual authentication between this backend and the local hardware daemon.
 * - Validation of short assertion expiry.
 * 
 * Data Privacy:
 * - The daemon must NOT expose raw templates, keys, or biometric image data.
 */
export class HardwareBiometricProvider implements IBiometricProvider {
  providerType: "MOCK" | "HARDWARE" = "HARDWARE";

  private daemonUrl: string;
  private backendClientCertPath: string;

  constructor() {
    this.daemonUrl = process.env.BIOMETRIC_DAEMON_URL || "https://localhost:8443";
    this.backendClientCertPath = process.env.BIOMETRIC_CLIENT_CERT_PATH || "";
  }

  async initialize(): Promise<void> {
    console.log("Initializing HardwareBiometricProvider...");
    
    if (!this.backendClientCertPath) {
      console.warn("⚠️  WARNING: BIOMETRIC_CLIENT_CERT_PATH not provided. Mutual authentication may fail.");
    }
    
    // TODO: Verify connectivity to the local biometric daemon and establish mutual TLS.
  }

  async verifyScanAssertion(payload: any): Promise<ScanVerificationResult> {
    const { deviceId, signature, livenessScore, nonce } = payload;
    
    // TODO: 
    // 1. Verify nonce exists and hasn't been replayed (Replay protection).
    // 2. Extract the device certificate from the payload or fetch it from DB.
    // 3. Verify the certificate pinning/chain of trust.
    // 4. Verify the cryptographic signature against the raw payload data.
    // 5. Ensure liveness constraints meet banking standards (>85%).
    
    throw new Error("NOT_IMPLEMENTED: HardwareBiometricProvider requires the vendor SDK and local daemon setup.");
  }

  async healthCheck(): Promise<{ status: "OK" | "DEGRADED" | "DOWN"; devicesConnected: number; message?: string }> {
    try {
      // TODO: Perform a lightweight mTLS ping to `this.daemonUrl/health`
      // Return the connection state without exposing any sensitive parameters.
      
      return {
        status: "DOWN",
        devicesConnected: 0,
        message: "Hardware provider not yet implemented."
      };
    } catch (err: any) {
      return {
        status: "DOWN",
        devicesConnected: 0,
        message: err.message
      };
    }
  }
}

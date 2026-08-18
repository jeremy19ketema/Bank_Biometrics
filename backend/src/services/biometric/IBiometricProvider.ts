export interface DeviceInfo {
  id: string;
  vendor: string;
  model: string;
  connectionType: "USB" | "NETWORK" | "BLUETOOTH";
  status: "ONLINE" | "OFFLINE" | "ERROR";
  lastSeen?: Date;
}

export interface ScanVerificationResult {
  isValid: boolean;
  livenessScore: number;
  matchScore?: number;
  signatureValid: boolean;
  deviceId: string;
  error?: string;
}

export interface IBiometricProvider {
  providerType: "MOCK" | "HARDWARE";

  /**
   * Initializes the biometric provider (e.g. loads SDKs or establishes daemon connection).
   */
  initialize(): Promise<void>;

  /**
   * Validates a signed scan assertion (sent from the frontend/device)
   * This handles the cryptographic checks, liveness, and certificate validation.
   */
  verifyScanAssertion(payload: any): Promise<ScanVerificationResult>;

  /**
   * Health check method that reports device connectivity.
   * Never exposes templates, keys, or raw biometric data.
   */
  healthCheck(): Promise<{ status: "OK" | "DEGRADED" | "DOWN", devicesConnected: number, message?: string }>;
}

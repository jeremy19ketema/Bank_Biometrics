import { IBiometricProvider, ScanVerificationResult } from "./IBiometricProvider.js";

export class MockBiometricProvider implements IBiometricProvider {
  providerType: "MOCK" | "HARDWARE" = "MOCK";

  async initialize(): Promise<void> {
    console.warn("⚠️  WARNING: Using MockBiometricProvider.");
    console.warn("Demo biometric mode — not for real banking authorization.");
  }

  async verifyScanAssertion(payload: any): Promise<ScanVerificationResult> {
    // Hard safeguard against production execution for the mock provider.
    // We already crash the server in ProviderFactory if loaded directly in production,
    // but this covers cases where it might be loaded indirectly or injected during testing.
    if (process.env.NODE_ENV === "production") {
      throw new Error("SECURITY EXCEPTION: MockBiometricProvider cannot be used in a production environment.");
    }

    const { deviceId, signature, livenessScore, expiresAt, isMatch, matchScore } = payload;

    // Simulate Liveness / Anti-Spoof Check
    if (livenessScore === undefined || livenessScore < 85.0) {
      return {
        isValid: false,
        livenessScore: livenessScore || 0,
        signatureValid: false,
        deviceId: deviceId,
        error: "Liveness check failed. Spoofing detected."
      };
    }

    // Simulate Cryptographic Signature Check
    const expectedSignaturePrefix = `device-sig-${deviceId}-`;
    const signatureValid = signature?.startsWith(expectedSignaturePrefix) ?? false;

    if (!signatureValid) {
      return {
        isValid: false,
        livenessScore,
        signatureValid: false,
        deviceId,
        error: "Invalid biometric signature"
      };
    }

    // Simulate Expiry
    if (new Date(expiresAt) < new Date()) {
      return {
        isValid: false,
        livenessScore,
        signatureValid,
        deviceId,
        error: "Biometric scan assertion has expired"
      };
    }

    return {
      isValid: true,
      livenessScore,
      matchScore: matchScore || 90.0,
      signatureValid: true,
      deviceId
    };
  }

  async healthCheck(): Promise<{ status: "OK" | "DEGRADED" | "DOWN"; devicesConnected: number; message?: string }> {
    return {
      status: "OK",
      devicesConnected: 1,
      message: "Mock biometric provider running smoothly."
    };
  }
}

/**
 * Aegis Multi-Modal Biometric Provider Contract
 * 
 * This contract defines the interfaces that external vendor SDKs (Fingerprint, Iris)
 * must implement to bridge their physical USB hardware with the Aegis system.
 * 
 * Future SDK Daemons must connect via secured WebSockets or local REST agents 
 * and comply with the following schemas.
 */

export type ProviderType = "FINGERPRINT" | "IRIS" | "FACE" | "MOCK";

export interface MultiModalProvider {
  /** The type of biometric hardware */
  type: ProviderType;

  /** Initialize the hardware connection */
  connect(deviceUri: string): Promise<boolean>;

  /** 
   * Captures a raw scan, processes the template locally on the device (if supported),
   * and returns the biometric encrypted payload.
   */
  captureScan(): Promise<BiometricPayload>;

  /** Validates a captured scan against a known template */
  verify(templateId: string, capturedPayload: BiometricPayload): Promise<VerificationResult>;

  /** Gracefully disconnect hardware */
  disconnect(): Promise<void>;
}

export interface BiometricPayload {
  format: "ISO_19794_2" | "PROPRIETARY" | "RAW_IMAGE";
  data: string; // Base64 encoded encrypted template
  qualityScore: number;
}

export interface VerificationResult {
  match: boolean;
  confidence: number;
  providerDetails?: any;
}

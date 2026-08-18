import { IBiometricProvider } from "./IBiometricProvider.js";
import { MockBiometricProvider } from "./MockBiometricProvider.js";
import { HardwareBiometricProvider } from "./HardwareBiometricProvider.js";

export class ProviderFactory {
  private static provider: IBiometricProvider | null = null;

  static async getBiometricProvider(): Promise<IBiometricProvider> {
    if (this.provider) {
      return this.provider;
    }

    const providerType = process.env.BIOMETRIC_PROVIDER?.toUpperCase();
    const isProduction = process.env.NODE_ENV === "production";

    // 1. Production Safeguards
    if (isProduction && (providerType === "MOCK" || !providerType)) {
      // Hard crash on startup to prevent accidental deployment with demo biometric authorization
      console.error("FATAL ERROR: Refusing to start in PRODUCTION mode with MOCK or missing biometric provider.");
      console.error("You MUST configure BIOMETRIC_PROVIDER=HARDWARE in the production environment.");
      process.exit(1);
    }

    // 2. Instantiate Provider
    if (providerType === "HARDWARE") {
      this.provider = new HardwareBiometricProvider();
    } else {
      this.provider = new MockBiometricProvider();
    }

    await this.provider.initialize();
    return this.provider;
  }
}

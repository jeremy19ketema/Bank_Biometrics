import { ProviderFactory } from "./services/biometric/ProviderFactory.js";

async function runPhase8Test() {
  console.log("=== Running Phase 8: Production Safeguard Test ===");

  // Simulate Production Environment
  process.env.NODE_ENV = "production";
  process.env.BIOMETRIC_PROVIDER = "MOCK";

  console.log("Simulating environment:", { NODE_ENV: process.env.NODE_ENV, BIOMETRIC_PROVIDER: process.env.BIOMETRIC_PROVIDER });

  try {
    // In our implementation, ProviderFactory does a hard process.exit(1) if MOCK is loaded in production.
    // However, for testing, if we mock the exit or just instantiate MockBiometricProvider directly, we can test the verifyScan assertion throw.
    
    // We will bypass the factory process.exit(1) just for testing the provider's internal throw.
    const { MockBiometricProvider } = await import("./services/biometric/MockBiometricProvider.js");
    const mockProvider = new MockBiometricProvider();

    await mockProvider.verifyScanAssertion({
      deviceId: "test-device",
      signature: "device-sig-test-device-12345",
      livenessScore: 90.0,
      expiresAt: new Date(Date.now() + 100000).toISOString()
    });

    console.error("❌ FAILED: Mock provider permitted verification in production mode!");
  } catch (err: any) {
    if (err.message.includes("SECURITY EXCEPTION: MockBiometricProvider cannot be used in a production environment")) {
      console.log("✅ SUCCESS: MockBiometricProvider successfully blocked biometric verification in production mode.");
      console.log("Error caught:", err.message);
    } else {
      console.error("❌ Unexpected error:", err);
    }
  }
}

runPhase8Test().catch(e => console.error(e));

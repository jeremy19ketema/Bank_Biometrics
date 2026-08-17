import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Running Phase 4 Integrations & API Gateway Tests ===\n");

  // 1. Login as SUPER_ADMIN
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "superadmin_real", passcode: "admin123" })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (!token) {
    console.error("Failed to login as SUPER_ADMIN.");
    return;
  }

  // --- Test A: Registration & Encryption ---
  console.log("\n[Test A] Registering Integration with AES-256-GCM Encryption...");
  const uniqueName = `Core Banking T24 ${Date.now()}`;
  const registerRes = await fetch("http://localhost:5000/api/integrations", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ name: uniqueName, type: "CORE_BANKING", endpoint: "https://api.t24.local/v1", apiKey: "super-secret-key-12345" })
  });
  const registerData = await registerRes.json();
  
  if (registerData.success) {
     console.log(`✅ Passed: Registration successful (ID: ${registerData.data.id})`);
  } else {
     console.error("❌ Failed:", registerData);
     return;
  }
  const integrationId = registerData.data.id;

  // --- Test B: Masked Retrieval ---
  console.log("\n[Test B] Verifying GET Endpoint Masks the Secret...");
  const getRes = await fetch("http://localhost:5000/api/integrations", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const getData = await getRes.json();
  const createdIntg = getData.data.find((i: any) => i.id === integrationId);
  
  if (createdIntg && createdIntg.maskedKey && !createdIntg.encryptedKey && !createdIntg.maskedKey.includes("super-secret-key")) {
     console.log(`✅ Passed: Secret is correctly masked (${createdIntg.maskedKey}) and ciphertext is never returned to the client.`);
  } else {
     console.error("❌ Failed:", createdIntg);
  }

  // --- Test C: Test Connection (Decryption Validation) ---
  console.log("\n[Test C] Testing Connection (Validates AES Decryption)...");
  const testRes = await fetch(`http://localhost:5000/api/integrations/${integrationId}/test`, {
    method: "POST", headers: { "Authorization": `Bearer ${token}` }
  });
  const testData = await testRes.json();
  if (testData.success) {
     console.log("✅ Passed: Test connection triggered successful decryption and simulated network call.");
  } else {
     console.error("❌ Failed:", testData);
  }

  // --- Test D: Rotate Key ---
  console.log("\n[Test D] Rotating Secret Key...");
  const rotateRes = await fetch(`http://localhost:5000/api/integrations/${integrationId}/rotate`, {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ newApiKey: "new-super-secret-key-999" })
  });
  const rotateData = await rotateRes.json();
  if (rotateData.success) {
     console.log("✅ Passed: API Key successfully rotated.");
  } else {
     console.error("❌ Failed:", rotateData);
  }

  // --- Test E: Tamper Handling ---
  console.log("\n[Test E] Simulating Database Tampering...");
  // Directly modify the authTag in the database to trigger an integrity failure
  await prisma.systemIntegration.update({
      where: { id: integrationId },
      data: { authTag: "deadbeefdeadbeefdeadbeefdeadbeef" } // Invalid GCM auth tag
  });

  const tamperRes = await fetch(`http://localhost:5000/api/integrations/${integrationId}/test`, {
    method: "POST", headers: { "Authorization": `Bearer ${token}` }
  });
  const tamperData = await tamperRes.json();
  if (!tamperData.success && tamperData.message.includes("Possible tampering")) {
     console.log("✅ Passed: AES-GCM successfully caught the tampered ciphertext and rejected the connection.");
  } else {
     console.error("❌ Failed. Expected tampering rejection, got:", tamperData);
  }

  console.log("\n=== Phase 4 Tests Completed ===");
}

runTests();

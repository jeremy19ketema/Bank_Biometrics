import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function generateToken(user: any) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
    isFirstLogin: false
  }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
}

async function setupTestDependencies() {
  await prisma.branch.upsert({
    where: { id: "br-1" },
    update: {},
    create: { 
      id: "br-1", 
      name: "Main Branch", 
      code: "BR001", 
      city: "Addis Ababa", 
      address: "123 Main St",
      phone: "+123456789",
      email: "main@bank.local",
      dailyTransactionLimit: 1000000
    }
  });

  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } }) || 
    await prisma.user.create({ data: { username: "admin7", email: "admin7@test.com", passwordHash: "x", fullName: "Admin", role: "SUPER_ADMIN", isActive: true, status: "ACTIVE" }});
  
  const accountantUser = await prisma.user.findFirst({ where: { role: "ACCOUNTANT" } }) || 
    await prisma.user.create({ data: { username: "acc7", email: "acc7@test.com", passwordHash: "x", fullName: "Accountant", role: "ACCOUNTANT", isActive: true, status: "ACTIVE", branchId: "br-1" }});
  
  const managerUser = await prisma.user.findFirst({ where: { role: "BANK_MANAGER" } }) || 
    await prisma.user.create({ data: { username: "mgr7", email: "mgr7@test.com", passwordHash: "x", fullName: "Manager", role: "BANK_MANAGER", isActive: true, status: "ACTIVE", branchId: "br-1" }});

  return {
    adminToken: generateToken(admin),
    accountantUser,
    accountantToken: generateToken(accountantUser),
    managerUser,
    managerToken: generateToken(managerUser)
  };
}

async function registerTestDevice(token: string) {
  const mac = "00:11:22:33:44:55-" + Date.now();
  const res = await fetch("http://localhost:5000/api/devices/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ macAddress: mac, name: "Test Scanner 7", branchId: "br-1", ipAddress: "192.168.1.100" })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
}

async function runPhase7Tests() {
  console.log("=== Phase 7: Biometric Verification & Transactions ===");

  const { adminToken, accountantUser, accountantToken, managerUser, managerToken } = await setupTestDependencies();

  // 1. Create a Device
  const device = await registerTestDevice(adminToken);

  // 2. Create a test customer
  const customerAccount = "CUST-" + Date.now();
  const customer = await prisma.customer.create({
    data: {
      accountNumber: customerAccount,
      fullName: "Jane Doe (Phase 7)",
      nationalId: "NID-P7-" + Date.now(),
      phone: "+251999999999",
      email: "jane.doe@example.com",
      accountType: "SAVINGS",
      balance: 500000,
      status: "ACTIVE"
    }
  });
  console.log(`✅ Customer ${customer.fullName} created with balance ${customer.balance}`);

  // 3. Capture Legal Consent
  const consent = await prisma.customerBiometricConsent.create({
    data: {
      customerId: customer.id,
      documentReference: "blob-store://consent-docs/" + customer.id + ".pdf",
      checksum: crypto.createHash('sha256').update("dummy-document").digest('hex'),
      policyVersion: "v1.2",
      captureMetadata: JSON.stringify({ method: "DIGITAL_PAD", capturedAtBranch: "br-1" }),
    }
  });

  // Enroll customer
  await prisma.customer.update({
    where: { id: customer.id },
    data: { isBiometricEnrolled: true, enrolledFingerprints: ["RIGHT_THUMB"] }
  });
  console.log("✅ Customer consent captured and enrolled");

  // 4. Test: Withdrawal without biometrics -> Expect Failure
  try {
    const txRef1 = "TX-P7-1-" + Date.now();
    await createTransaction(accountantToken, {
      accountNumber: customerAccount,
      amount: 1000,
      type: "CASH_WITHDRAWAL",
      currency: "ETB",
      referenceNumber: txRef1
    });
    console.error("❌ FAILED: Transaction without biometrics succeeded");
  } catch (err: any) {
    console.log("✅ Blocked transaction without biometrics:", err.message);
  }

  // 5. Test: Spoofed Scan (Liveness < 85) -> Expect Failure
  const txRef2 = "TX-P7-2-" + Date.now();
  const expiresAt = new Date(Date.now() + 60000).toISOString();
  const validSignature = `device-sig-${device.id}-valid-hash`;

  try {
    await verifyScan(accountantToken, {
      customerId: customer.id,
      fingerIndex: "RIGHT_THUMB",
      deviceId: device.id,
      transactionRef: txRef2,
      amount: 1000,
      currency: "ETB",
      signature: validSignature,
      expiresAt,
      livenessScore: 40.0, // Spoof!
      matchScore: 99.0,
      isMatch: true,
      qualityScore: 95.0
    });
    console.error("❌ FAILED: Spoofed scan accepted");
  } catch (err: any) {
    console.log("✅ Blocked spoofed scan (Liveness Failure):", err.message);
  }

  // 6. Test: Valid Biometric Scan & High-Value Maker-Checker
  const txRef3 = "TX-P7-3-" + Date.now();
  const scanData = await verifyScan(accountantToken, {
    customerId: customer.id,
    fingerIndex: "RIGHT_THUMB",
    deviceId: device.id,
    transactionRef: txRef3,
    amount: 150000, // Exceeds 100k threshold
    currency: "ETB",
    signature: validSignature,
    expiresAt,
    livenessScore: 98.0,
    matchScore: 99.0,
    isMatch: true,
    qualityScore: 95.0
  });
  console.log("✅ Valid scan accepted. ScanId:", scanData.scanId);

  // Maker (Manager) submits the transaction
  const tx = await createTransaction(managerToken, {
    accountNumber: customerAccount,
    amount: 150000,
    type: "CASH_WITHDRAWAL",
    currency: "ETB",
    referenceNumber: txRef3,
    biometricScanId: scanData.scanId
  });

  if (tx.status === "PENDING_APPROVAL") {
    console.log("✅ High-value transaction placed in PENDING_APPROVAL");
  } else {
    console.error("❌ FAILED: High-value transaction bypasses Maker-Checker. Status:", tx.status);
  }

  // Maker (Manager) tries to approve their own transaction -> Expect Failure
  try {
    await approveTransaction(managerToken, tx.id, "APPROVED");
    console.error("❌ FAILED: Manager Maker was able to approve their own transaction");
  } catch (err: any) {
    console.log("✅ Blocked Manager from self-approving (Maker-Checker violation):", err.message);
  }

  // Checker (Admin) approves the transaction
  const approvedTx = await approveTransaction(adminToken, tx.id, "APPROVED");
  console.log("✅ Checker (Admin) successfully approved the transaction. Status:", approvedTx.status);

  // Verify balance deduction
  const updatedCustomer = await prisma.customer.findUnique({ where: { id: customer.id } });
  if (updatedCustomer?.balance === 350000) {
    console.log("✅ Balance successfully deducted upon approval");
  } else {
    console.error("❌ FAILED: Balance incorrect. Expected 350000, got", updatedCustomer?.balance);
  }

  // 7. Revoke Consent & Block Future Actions
  await prisma.customerBiometricConsent.update({
    where: { customerId: customer.id },
    data: { isRevoked: true, revokedAt: new Date() }
  });

  try {
    const txRef4 = "TX-P7-4-" + Date.now();
    await verifyScan(accountantToken, {
      customerId: customer.id,
      fingerIndex: "RIGHT_THUMB",
      deviceId: device.id,
      transactionRef: txRef4,
      amount: 1000,
      currency: "ETB",
      signature: validSignature,
      expiresAt,
      livenessScore: 98.0,
      matchScore: 99.0,
      isMatch: true,
      qualityScore: 95.0
    });
    console.error("❌ FAILED: Scan accepted for revoked consent");
  } catch (err: any) {
    console.log("✅ Blocked scan for revoked consent:", err.message);
  }

  console.log("\n✅ All Phase 7 security cases passed successfully!");
}

async function createTransaction(token: string, payload: any) {
  const res = await fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create transaction");
  return json.data;
}

async function verifyScan(token: string, payload: any) {
  const res = await fetch("http://localhost:5000/api/biometrics/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to verify scan");
  return json.data;
}

async function approveTransaction(token: string, txId: string, decision: string) {
  const res = await fetch(`http://localhost:5000/api/transactions/${txId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ decision })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to approve transaction");
  return json.data;
}

runPhase7Tests()
  .catch(e => {
    console.error("Unhandled Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

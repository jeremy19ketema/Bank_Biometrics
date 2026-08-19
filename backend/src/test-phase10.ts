import { PrismaClient } from "@prisma/client";
import { checkSystemStatus } from "./controllers/systemController.js";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

const prisma = new PrismaClient();

class MockRes {
  statusCode: number = 200;
  body: any;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.body = data;
    return this;
  }
}

async function runTest() {
  console.log("=== Phase 10 Verification ===");

  const globalAdmin = await prisma.user.findFirst({ where: { username: "superadmin_real" } });
  
  if (!globalAdmin) {
    throw new Error("Missing seeded global admin. Run seed-superadmin.ts first.");
  }

  // 1. Test System Status Endpoint
  console.log("\\nTesting System Status Endpoint...");
  const req = { user: globalAdmin } as unknown as Request;
  const res = new MockRes() as unknown as Response;
  
  await checkSystemStatus(req, res);
  const body = (res as unknown as MockRes).body;
  console.log("Status response:", body);
  if (!body.success) throw new Error("Status endpoint failed");

  console.log("\\nTesting Real Backup & Restore...");
  try {
    const backupScript = new URL("../scripts/backup.cjs", import.meta.url).pathname;
    const isWindows = process.platform === "win32";
    let scriptPath = isWindows && backupScript.startsWith("/") ? backupScript.substring(1) : backupScript;
    scriptPath = decodeURIComponent(scriptPath);
    
    // 1. Run backup
    console.log("Running backup.cjs...");
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    
    // 2. Find latest encrypted backup
    const backupDir = "C:\\\\Backups\\\\BankBiometrics";
    const files = fs.readdirSync(backupDir).filter((f: string) => f.endsWith(".backup.enc"));
    files.sort((a: string, b: string) => fs.statSync(path.join(backupDir, b)).mtimeMs - fs.statSync(path.join(backupDir, a)).mtimeMs);
    const latestBackup = files[0];
    if (!latestBackup) throw new Error("No encrypted backup found!");
    
    const encPath = path.join(backupDir, latestBackup);
    const decPath = path.join(backupDir, latestBackup.replace(".enc", ""));
    console.log(`Decrypting backup: ${latestBackup}...`);
    
    // 3. Decrypt with AES-256-GCM
    const encryptionKey = "0123456789abcdef0123456789abcdef";
    const backupBuffer = fs.readFileSync(encPath);
    
    const iv = backupBuffer.subarray(0, 12);
    const tag = backupBuffer.subarray(backupBuffer.length - 16);
    const ciphertext = backupBuffer.subarray(12, backupBuffer.length - 16);
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(encryptionKey), iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    fs.writeFileSync(decPath, decrypted);
    
    // 4. Restore to test DB
    console.log("Restoring to bank_biometrics_test...");
    const execOpts = { stdio: "inherit" as any, env: { ...process.env, PGPASSWORD: "postgres" } };
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS bank_biometrics_test;"`, execOpts);
    execSync(`psql -U postgres -c "CREATE DATABASE bank_biometrics_test;"`, execOpts);
    
    // Use pg_restore
    try {
      execSync(`pg_restore -U postgres -d bank_biometrics_test -1 "${decPath}"`, execOpts);
    } catch (e: any) {
      console.log("pg_restore finished with warnings (normal for dumps).");
    }
    
    // 5. Verify restored DB
    const queryOpts = { env: { ...process.env, PGPASSWORD: "postgres" } };
    const resTest = execSync(`psql -U postgres -d bank_biometrics_test -t -c "SELECT COUNT(*) FROM \\"User\\";"`, queryOpts).toString().trim();
    if (parseInt(resTest) < 1) throw new Error("Restored DB is empty!");
    console.log(`✅ Restore successful! Verified user count: ${resTest}`);
    
    // Cleanup
    fs.unlinkSync(decPath);
  } catch (err: any) {
    throw new Error("Backup & Restore test failed: " + err.message);
  }
  
  console.log("\\n✅ Phase 10 Tests Passed Successfully");
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

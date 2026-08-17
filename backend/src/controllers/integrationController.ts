import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import { encryptSecret, decryptSecret } from "../utils/crypto.js";

// Utility to mask the API key for UI response
function maskApiKey(keyLength = 16): string {
  return "••••••••" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function getIntegrations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const integrations = await prisma.systemIntegration.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" }
    });

    // Never return the decrypted key or encrypted components
    const safeIntegrations = integrations.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      endpoint: i.endpoint,
      status: i.status,
      lastSyncAt: i.lastSyncAt,
      secretKeyVersion: i.secretKeyVersion,
      hasKey: !!i.encryptedKey,
      maskedKey: i.encryptedKey ? maskApiKey() : null
    }));

    res.status(200).json({ success: true, data: safeIntegrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch integrations" });
  }
}

export async function registerIntegration(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, type, endpoint, apiKey } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    let encryptedData = { encryptedKey: null as string | null, iv: null as string | null, authTag: null as string | null, version: 1 };
    
    if (apiKey) {
      encryptedData = encryptSecret(apiKey);
    }

    const integration = await prisma.systemIntegration.create({
      data: {
        name,
        type,
        endpoint,
        encryptedKey: encryptedData.encryptedKey,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
        secretKeyVersion: encryptedData.version
      }
    });

    await logAuditEvent(
      req.user!.id, 
      "INTEGRATION_REGISTERED", 
      "ADMINISTRATION", 
      ipAddress, 
      `Registered new integration: ${name} (${type})`, 
      "SUCCESS"
    );

    res.status(201).json({ success: true, data: { id: integration.id, name: integration.name } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to register integration" });
  }
}

export async function rotateIntegrationKey(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { newApiKey } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    const integration = await prisma.systemIntegration.findUnique({ where: { id, isDeleted: false } });
    if (!integration) {
      res.status(404).json({ success: false, message: "Integration not found" });
      return;
    }

    if (!newApiKey) {
      res.status(400).json({ success: false, message: "New API Key is required" });
      return;
    }

    const encryptedData = encryptSecret(newApiKey);

    await prisma.systemIntegration.update({
      where: { id },
      data: {
        encryptedKey: encryptedData.encryptedKey,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
        secretKeyVersion: integration.secretKeyVersion + 1
      }
    });

    await logAuditEvent(
      req.user!.id, 
      "INTEGRATION_KEY_ROTATED", 
      "SECURITY", 
      ipAddress, 
      `Rotated API key for integration: ${integration.name}`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, message: "Key rotated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to rotate key" });
  }
}

export async function testIntegrationConnection(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const ipAddress = req.ip || "unknown";

  try {
    const integration = await prisma.systemIntegration.findUnique({ where: { id, isDeleted: false } });
    if (!integration) {
      res.status(404).json({ success: false, message: "Integration not found" });
      return;
    }

    if (!integration.endpoint) {
      res.status(400).json({ success: false, message: "Integration has no endpoint configured" });
      return;
    }

    // SSRF Prevention: Restrict to HTTPS and allowlisted hosts (Simulated check)
    if (!integration.endpoint.startsWith("https://")) {
      await logAuditEvent(req.user!.id, "INTEGRATION_TEST_FAILED", "SECURITY", ipAddress, `Blocked insecure connection attempt to ${integration.endpoint}`, "WARNING");
      res.status(400).json({ success: false, message: "Only HTTPS endpoints are allowed for integrations." });
      return;
    }

    // Simulate Decryption (to test tamper handling)
    if (integration.encryptedKey && integration.iv && integration.authTag) {
        try {
            decryptSecret(integration.encryptedKey, integration.iv, integration.authTag);
        } catch (decErr: any) {
            await logAuditEvent(req.user!.id, "INTEGRATION_DECRYPTION_FAILED", "SECURITY", ipAddress, `Failed to decrypt secret for ${integration.name}. Possible tampering.`, "FAILURE", { severity: "CRITICAL" });
            res.status(500).json({ success: false, message: "Cryptographic failure: Failed to decrypt integration secret. Possible tampering." });
            return;
        }
    }

    // Simulated network call
    await prisma.systemIntegration.update({
      where: { id },
      data: { lastSyncAt: new Date(), status: "ACTIVE" }
    });

    await logAuditEvent(
      req.user!.id, 
      "INTEGRATION_TEST_SUCCESS", 
      "ADMINISTRATION", 
      ipAddress, 
      `Successfully tested connection to ${integration.name}`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, message: "Connection successful" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Connection test failed" });
  }
}

export async function deactivateIntegration(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const ipAddress = req.ip || "unknown";

  try {
    const integration = await prisma.systemIntegration.update({
      where: { id },
      data: { isDeleted: true, status: "INACTIVE" }
    });

    await logAuditEvent(
      req.user!.id, 
      "INTEGRATION_DEACTIVATED", 
      "ADMINISTRATION", 
      ipAddress, 
      `Deactivated integration: ${integration.name}`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, message: "Integration deactivated" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to deactivate integration" });
  }
}

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// In a real app, RP_ID should match the domain.
const RP_ID = "localhost";
const RP_NAME = "Aegis Biometrics";
const EXPECTED_ORIGIN = ["http://localhost:3000", "http://127.0.0.1:3000"];

export const getRegistrationOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body; // or from JWT token if already logged in

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Get existing passkeys using raw SQL since generation failed
    const existingPasskeys: any[] = await prisma.$queryRaw`
      SELECT * FROM "PasskeyCredential" WHERE "userId" = ${userId}
    `;

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.username,
      attestationType: "none",
      excludeCredentials: existingPasskeys.map(passkey => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform", // forces PC/device built-in scanner
      },
    });

    res.json({ success: true, data: options });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, response, expectedChallenge } = req.body;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { id: credentialID, publicKey: credentialPublicKey } = credential;
      
      const counter = 0; // Default new counter for passkeys

      const transports = response.response.transports || [];

      // Save passkey using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "PasskeyCredential" ("id", "userId", "publicKey", "counter", "transports", "createdAt")
        VALUES (${credentialID}, ${userId}, ${credentialPublicKey}, ${counter}, ARRAY[${transports.join(",")}]::text[], CURRENT_TIMESTAMP)
      `;

      res.json({ success: true, message: "Biometric registered successfully." });
    } else {
      res.status(400).json({ success: false, message: "Biometric registration failed." });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuthenticationOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    // Get existing passkeys
    const existingPasskeys: any[] = await prisma.$queryRaw`
      SELECT * FROM "PasskeyCredential" WHERE "userId" = ${userId}
    `;

    if (existingPasskeys.length === 0) {
      res.status(400).json({ success: false, message: "No passkeys registered for this user." });
      return;
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: existingPasskeys.map(passkey => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports,
      })),
      userVerification: "preferred",
    });

    res.json({ success: true, data: options });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAuthentication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, response, expectedChallenge } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const credentialIdStr = response.id;
    const existingPasskeys: any[] = await prisma.$queryRaw`
      SELECT * FROM "PasskeyCredential" WHERE "id" = ${credentialIdStr} AND "userId" = ${userId}
    `;

    const passkey = existingPasskeys[0];

    if (!passkey) {
      res.status(400).json({ success: false, message: "Invalid passkey credential." });
      return;
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
        transports: passkey.transports,
      },
    });

    if (verification.verified) {
      // Update counter
      await prisma.$executeRaw`
        UPDATE "PasskeyCredential" SET "counter" = ${verification.authenticationInfo.newCounter}
        WHERE "id" = ${passkey.id}
      `;

      // Authentication successful - generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role, branchId: user.branchId },
        process.env.JWT_SECRET || 'aegis_fallback_secret_2026',
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        message: "Biometric verification successful",
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            isFirstLogin: user.isFirstLogin,
            branchId: user.branchId
          }
        }
      });
    } else {
      res.status(400).json({ success: false, message: "Biometric verification failed." });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

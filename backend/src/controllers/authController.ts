import { Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "8h") as SignOptions["expiresIn"];

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET as Secret | undefined;
  if (!secret) throw new Error("JWT_SECRET must be configured before the API can start");
  return secret;
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!username || !passcode) {
    res.status(400).json({ success: false, message: "Username and passcode are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { branch: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Invalid credentials or deactivated operator" });
      return;
    }

    // Check if user is disabled or locked
    if (user.status === "DISABLED" || user.status === "LOCKED") {
      res.status(401).json({ success: false, message: `Account is ${user.status.toLowerCase()}. Contact your administrator.` });
      return;
    }

    if (user.status === "PENDING_APPROVAL") {
      res.status(401).json({ success: false, message: "Account is pending approval. You cannot log in yet." });
      return;
    }

    const isMatch = await bcrypt.compare(passcode, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent(user.id, "USER_LOGIN_FAILED", "SECURITY", ipAddress, `Failed login attempt for username: ${username}`, "FAILURE");
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Generate JWT including isFirstLogin flag
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name || null,
        isFirstLogin: user.isFirstLogin
      },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await logAuditEvent(user.id, "USER_LOGIN", "SECURITY", ipAddress, `Operator authenticated successfully: ${username}`, "SUCCESS");

    res.status(200).json({
      success: true,
      token,
      isFirstLogin: user.isFirstLogin,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name || null,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isFirstLogin: user.isFirstLogin,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function updatePasscode(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { currentPasscode, newPasscode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!currentPasscode || !newPasscode) {
    res.status(400).json({ success: false, message: "Current and new passcodes are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPasscode, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent(user.id, "PASSCODE_UPDATE_FAILED", "SECURITY", ipAddress, "Attempted passcode change with invalid current passcode", "FAILURE");
      res.status(400).json({ success: false, message: "Invalid current passcode" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPasscode, 10);

    // If this was a first login, mark isFirstLogin as false and status as ACTIVE
    const updateData: any = { passwordHash };
    if (user.isFirstLogin) {
      updateData.isFirstLogin = false;
      updateData.status = "ACTIVE";
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    await logAuditEvent(user.id, user.isFirstLogin ? "FIRST_LOGIN_CREDENTIAL_CHANGE" : "PASSCODE_UPDATE_SUCCESS", "SECURITY", ipAddress, "Passcode updated successfully", "SUCCESS");

    res.status(200).json({ success: true, message: "Passcode updated successfully", isFirstLoginCompleted: user.isFirstLogin });
  } catch (error) {
    console.error("Update Passcode Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Change username on first login
export async function changeUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { newUsername, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!newUsername || !passcode) {
    res.status(400).json({ success: false, message: "New username and passcode are required" });
    return;
  }

  try {
    // Check if username is taken
    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== req.user.id) {
      res.status(400).json({ success: false, message: "Username already taken" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { branch: true } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(passcode, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid passcode" });
      return;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { username: newUsername }
    });

    await logAuditEvent(req.user.id, "USERNAME_CHANGE", "SECURITY", ipAddress, `Username changed to: ${newUsername}`, "SUCCESS");

    res.status(200).json({ success: true, message: "Username updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to change username" });
  }
}

// Complete first login (change both username and passcode in one go)
export async function completeFirstLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { newUsername, currentPasscode, newPasscode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!newPasscode || !currentPasscode) {
    res.status(400).json({ success: false, message: "Current passcode and new passcode are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { branch: true } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPasscode, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid current passcode" });
      return;
    }

    const updateData: any = {
      passwordHash: await bcrypt.hash(newPasscode, 10),
      isFirstLogin: false,
      status: "ACTIVE"
    };

    if (newUsername && newUsername !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username: newUsername } });
      if (existing && existing.id !== req.user.id) {
        res.status(400).json({ success: false, message: "Username already taken" });
        return;
      }
      updateData.username = newUsername;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    // Generate new token without first login flag
    const token = jwt.sign(
      {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        branchId: updated.branchId,
        branchName: user.branch?.name || null,
        isFirstLogin: false
      },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logAuditEvent(req.user.id, "FIRST_LOGIN_COMPLETED", "SECURITY", ipAddress, "First login credential change completed", "SUCCESS");

    res.status(200).json({
      success: true,
      message: "Credentials updated successfully. You can now access the dashboard.",
      token,
      user: {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        branchId: updated.branchId,
        branchName: user.branch?.name || null,
        avatarUrl: updated.avatarUrl,
        isActive: updated.isActive,
        isFirstLogin: false,
        status: updated.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to complete first login" });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { branch: true }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name || null,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isFirstLogin: user.isFirstLogin,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Password reset (by admin)
export async function resetUserPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId, temporaryPasscode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!userId || !temporaryPasscode) {
    res.status(400).json({ success: false, message: "User ID and temporary passcode are required" });
    return;
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const passwordHash = await bcrypt.hash(temporaryPasscode, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        isFirstLogin: true,
        status: "PENDING_FIRST_LOGIN"
      }
    });

    await logAuditEvent(req.user.id, "PASSWORD_RESET", "ADMINISTRATION", ipAddress, `Password reset for user: ${targetUser.username}`, "SUCCESS");

    res.status(200).json({ success: true, message: "Password reset successfully. User will be required to change credentials on next login." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reset password" });
  }
}

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER" | "SUPER_ADMIN_IT" | "SUPER_ADMIN_FOREX" | "BANK_MANAGER" | "BRANCH_IT" | "ACCOUNTANT" | "HR";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    branchId?: string | null;
    isFirstLogin?: boolean;
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured before the API can start");
  return secret;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.headers.cookie
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("aegis_auth_token="))
    ?.slice("aegis_auth_token=".length);
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken;
  if (!token) {
    res.status(401).json({ success: false, message: "Authentication token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ success: false, message: "Access denied: insufficient permission" });
      return;
    }

    next();
  };
}

// Middleware to check that a Bank Manager or Branch IT only operates on their own branch
export function requireBranchAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { role, branchId } = req.user;
  const targetBranchId = req.params.branchId || req.body.branchId;

  // Super Admin roles can access any branch
  if (role === "SUPER_ADMIN" || role === "SUPER_ADMIN_MANAGER" || role === "SUPER_ADMIN_IT" || role === "SUPER_ADMIN_FOREX" || role =="HR") {
    return next();
  }

  // Bank Manager and Branch IT can only access their own branch
  if ((role === "BANK_MANAGER" || role === "BRANCH_IT") && targetBranchId) {
    if (branchId !== targetBranchId) {
      res.status(403).json({ success: false, message: "Access denied: you can only access your assigned branch" });
      return;
    }
  }

  next();
}

// Middleware to block first-login users from accessing dashboard routes
export function requireFirstLoginComplete(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (req.user.isFirstLogin) {
    res.status(403).json({
      success: false,
      message: "First login detected. You must change your credentials before accessing the dashboard.",
      requireCredentialChange: true
    });
    return;
  }

  next();
}

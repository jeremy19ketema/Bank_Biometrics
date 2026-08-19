import rateLimit from "express-rate-limit";
import { AuthenticatedRequest } from "./auth.js";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: { success: false, message: "Too many password reset attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, else IP
    const authReq = req as AuthenticatedRequest;
    return authReq.user ? authReq.user.id : authReq.ip || "unknown";
  },
  message: { success: false, message: "Export limit reached. Please try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const deviceHeartbeatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // devices ping frequently
  message: { success: false, message: "Device heartbeat rate limit exceeded." },
  standardHeaders: true,
  legacyHeaders: false,
});

import { Router } from "express";
import { login, updatePasscode, getMe, changeUsername, completeFirstLogin, resetUserPassword } from "../controllers/authController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts from this IP, please try again after 15 minutes" }
});

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/update-passcode", authenticateJWT, updatePasscode);
router.post("/change-username", authenticateJWT, changeUsername);
router.post("/complete-first-login", authenticateJWT, completeFirstLogin);
router.post("/reset-password", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "BANK_MANAGER", "BRANCH_IT"]), resetUserPassword);
router.get("/me", authenticateJWT, getMe);

export default router;

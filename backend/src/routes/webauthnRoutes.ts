import { Router } from "express";
import { 
  getRegistrationOptions, 
  verifyRegistration, 
  getAuthenticationOptions, 
  verifyAuthentication 
} from "../controllers/webauthnController.js";

const router = Router();

router.post("/register-options", getRegistrationOptions);
router.post("/register-verify", verifyRegistration);
router.post("/auth-options", getAuthenticationOptions);
router.post("/auth-verify", verifyAuthentication);

export default router;

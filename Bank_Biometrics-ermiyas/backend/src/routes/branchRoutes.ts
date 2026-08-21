import { Router } from "express";
import { getBranches, getBranchById, createBranch, updateBranch } from "../controllers/branchController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateJWT, getBranches);
router.get("/:id", authenticateJWT, getBranchById);
router.post("/", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "IT_SUPPORT"]), createBranch);
router.put("/:id", authenticateJWT, requireRole(["SUPER_ADMIN"]), updateBranch);

export default router;

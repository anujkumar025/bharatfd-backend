import { Router } from "express";
const router = Router();
import { adminLogin } from "../controllers/authController.js";

// Admin login
router.post("/login", adminLogin);

export default router;

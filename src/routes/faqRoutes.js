import { Router } from "express";
const router = Router();
import { getFAQs, addFAQ, updateFAQ, deleteFAQ, getSingleFAQ } from "../controllers/faqController.js";
import {authMiddleware} from './../middlewares/authMiddleware.js';

router.get("/", getFAQs);  // for all
router.get("/:id", getSingleFAQ); // for all
router.post("/", authMiddleware, addFAQ); // Admin only
router.put("/:id", authMiddleware, updateFAQ); // Admin only
router.delete("/:id", authMiddleware, deleteFAQ); // Admin only

export default router;
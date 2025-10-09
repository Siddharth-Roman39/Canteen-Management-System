import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createNotice, getNotices, deleteNotice } from "../controllers/noticeController.js";

const router = express.Router();

// Admin can create and delete notices
router.post("/", protect, authorizeRoles("admin"), createNotice);
router.delete("/:id", protect, authorizeRoles("admin"), deleteNotice);

// Everyone can view
router.get("/", protect, getNotices);

export default router;

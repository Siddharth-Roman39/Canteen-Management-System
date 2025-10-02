import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin statistics" });
});

export default router;

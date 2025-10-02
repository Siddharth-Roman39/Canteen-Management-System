import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/orders", protect, authorizeRoles("staff"), (req, res) => {
  res.json({ message: "Orders list for staff/admin" });
});

export default router;

import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Welcome Student" });
});

export default router;

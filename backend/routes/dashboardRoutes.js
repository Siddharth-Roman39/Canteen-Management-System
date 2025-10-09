import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin/dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user.email });
});

router.get("/staff/dashboard", protect, authorizeRoles("staff"), (req, res) => {
  res.json({ message: "Welcome Staff!", user: req.user.email });
});

router.get("/student/dashboard", protect, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Welcome Student!", user: req.user.email });
});

export default router;

import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createStaff, getAllStaff, updateStaff, removeStaff,
  listStudents, setStudentBan, deleteStudent
} from "../controllers/adminController.js";

const router = express.Router();

// NOTE: All routes below require admin role
router.use(protect, authorizeRoles("admin"));

// Staff management
router.post("/staff", createStaff);           // add staff
router.get("/staff", getAllStaff);            // list staff
router.put("/staff/:id", updateStaff);        // update role/subrole
router.delete("/staff/:id", removeStaff);     // remove staff (soft delete)

// Student management
router.get("/students", listStudents);                   // list all students
router.put("/students/:id/ban", setStudentBan);          // ban/unban student { ban: true|false }
router.delete("/students/:id", deleteStudent);           // delete student account

// A simple admin stats endpoint (optional)
router.get("/stats", (req, res) => {
  res.json({ message: "Admin statistics" });
});

export default router;

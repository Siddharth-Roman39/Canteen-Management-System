import Staff from "../models/Staff.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";

/**
 * STAFF ENDPOINTS
 */

// Create staff (admin only)
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role = "staff", subrole = "Other" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await Staff.findOne({ email });
    if (existing) return res.status(400).json({ message: "Staff with this email already exists" });

    const staff = new Staff({ name, email, password, role, subrole });
    await staff.save();

    const safe = (({ _id, name, email, role, subrole, status }) => ({ _id, name, email, role, subrole, status }))(staff);

    res.status(201).json({ success: true, staff: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ status: { $ne: "Removed" } }).select("-password");
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a staff's role/subrole
export const updateStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { role, subrole } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Prevent downgrading the last admin to non-admin
    if (staff.role === "admin" && role !== "admin") {
      const adminCount = await Staff.countDocuments({ role: "admin", status: "Active" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot remove admin role from the last admin" });
      }
    }

    if (role) staff.role = role;
    if (subrole) staff.subrole = subrole;

    await staff.save();
    res.json({ success: true, staff: { _id: staff._id, name: staff.name, role: staff.role, subrole: staff.subrole } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Soft delete / remove staff (set status Removed)
export const removeStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.status = "Removed";
    await staff.save();
    res.json({ success: true, message: "Staff removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * STUDENT MANAGEMENT
 */

// List students
export const listStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Ban or unban student
export const setStudentBan = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { ban } = req.body; // true to ban, false to unban

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isBanned = !!ban;
    await student.save();

    res.json({ success: true, student: { _id: student._id, name: student.name, email: student.email, isBanned: student.isBanned } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a student (permanent)
export const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.remove();
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

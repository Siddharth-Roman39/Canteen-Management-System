import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Staff from "../models/Staff.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Student Signup
export const signupStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) return res.status(400).json({ message: "Student already exists" });

    const student = await Student.create({ name, email, password });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: "student",
      token: generateToken(student._id, "student"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (student or staff/admin) - CORRECTED VERSION
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // --- CHANGE 1: Search for a Staff/Admin user FIRST ---
    let user = await Staff.findOne({ email });
    let role = user ? user.role : null; // Get role from staff record if it exists

    // --- CHANGE 2: If no staff user was found, THEN search for a Student ---
    if (!user) {
      user = await Student.findOne({ email });
      if (user) {
        role = "student"; // Set role to student only if found in the Student collection
      }
    }

    // If user is still not found in either collection, credentials are bad
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Now, compare the password for the found user
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If student is banned, prevent login
    if (role === "student" && user.isBanned) {
      return res.status(403).json({ message: "Account banned" });
    }

    // Generate token with the CORRECT role
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role, // This will now be 'admin' or 'staff' if found in the Staff collection
      token: generateToken(user._id, role),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
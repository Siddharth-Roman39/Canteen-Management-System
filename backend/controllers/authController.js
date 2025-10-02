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

// Login (student, staff, admin)
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Student.findOne({ email });
    let role = "student";

    if (!user) {
      user = await Staff.findOne({ email });
      if (user) role = user.role;
    }

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
      token: generateToken(user._id, role),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

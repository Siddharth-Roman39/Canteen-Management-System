import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Staff from "../models/Staff.js";

// Protect Routes
export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === "student") {
      user = await Student.findById(decoded.id).select("-password");
    } else {
      user = await Staff.findById(decoded.id).select("-password");
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { id: user._id, email: user.email, role: decoded.role };
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: "Token invalid" });
  }
};

// Role Authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user?.role}' not authorized` });
    }
    next();
  };
};

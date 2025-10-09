import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import staffRoutes from "./routes/staff.js";
import studentRoutes from "./routes/student.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js"; // ✅ NEW

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/student", studentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", menuRoutes);
app.use("/api/notices", noticeRoutes); // ✅ NEW

// Root
app.get("/", (req, res) => res.send("Canteen Management Backend Running"));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

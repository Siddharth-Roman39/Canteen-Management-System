// seeder.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Staff from "./models/Staff.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const seedStaffAdmin = async () => {
  try {
    const users = [
      { email: "admin@vit.edu.in", password: "admin123", role: "admin" },
      { email: "staff1@vit.edu.in", password: "staff1", role: "staff" },
      { email: "staff2@vit.edu.in", password: "staff2", role: "staff" },
      { email: "cashier@vit.edu.in", password: "cashier123", role: "staff" },
      { email: "counter@vit.edu.in", password: "counter123", role: "staff" },
    ];

    for (let u of users) {
      // Check if user already exists
      const exists = await Staff.findOne({ email: u.email.toLowerCase() });
      if (exists) {
        console.log(`${u.role} ${u.email} already exists`);
        continue;
      }

      // Create user with plain password (model will hash it)
      await Staff.create({
        email: u.email.toLowerCase(),
        password: u.password,
        role: u.role,
      });

      console.log(`Created ${u.role}: ${u.email}`);
    }

    console.log("Staff/Admin seeding completed!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedStaffAdmin();

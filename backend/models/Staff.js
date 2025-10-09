import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // top-level role: admin or staff
  role: { type: String, required: true, enum: ["admin", "staff"], default: "staff" },
  // subrole describes job / designation (Manager, Chef, Cashier, etc.)
  subrole: { type: String, default: "Other" },
  status: { type: String, enum: ["Active", "Removed"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

staffSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;

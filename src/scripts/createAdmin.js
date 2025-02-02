import { connect } from "mongoose";
import Admin from "../models/Admin.js";
import { hash } from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

connect(process.env.DATABASE)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB Error:", err));

// In createAdmin script:
const createAdmin = async () => {
  const existingAdmin = await Admin.findOne({ username: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit(0);
  }

  // Pass plain password, let the pre-save hook do the hashing
  const admin = new Admin({ username: "admin", password: "adminpassword" });
  
  await admin.save();
  console.log("Admin created successfully");
  process.exit(0);
};

createAdmin();


createAdmin();

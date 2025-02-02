import { Schema, model } from "mongoose";
import { genSalt, hash } from "bcrypt";

const AdminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving (only for new admin creation)
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

const Admin = model("Admin", AdminSchema);

export default Admin;
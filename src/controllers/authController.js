import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";

export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_PASSWORD, { expiresIn: "1d" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

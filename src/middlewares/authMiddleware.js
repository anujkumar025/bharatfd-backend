import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authMiddleware(req, res, next) {
  const token = req.header("Authorization");
  // console.log("token: ", token);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const strippedToken = token.replace("Bearer ", "");
    // console.log(`jwt password = ${process.env.JWT_PASSWORD} \n ${strippedToken}`);
    const decoded = jwt.verify(strippedToken, process.env.JWT_PASSWORD);
    // console.log(`authmiddleware ${decoded}`);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    req.admin = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid token" });
  }
}

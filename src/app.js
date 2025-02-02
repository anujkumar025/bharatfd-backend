import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
import faqRoutes from "./routes/faqRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

connect(process.env.DATABASE)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB Error:", err));

app.use("/api/faqs", faqRoutes);
app.use("/api/admin", adminRoutes);


export default app;
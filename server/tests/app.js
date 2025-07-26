// server/app.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "../routes/auth.js";
import attendanceRoutes from "../routes/attendance.js";
import adminRoutes from "../routes/admin.js";
import { auth, authorize } from "../middleware/auth.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
} else {
  dotenv.config();
}

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes); 
app.use("/api/admin", adminRoutes); 

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(process.env.PORT || 9000, () => {
    console.log(`Server running on port ${process.env.PORT || 9000}`);
  });
}

export { app, server };

import dotenv from 'dotenv';
import express , {json} from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import path from 'path';

const __dirname = path.resolve();

const app = express();
dotenv.config();

// MongoDB Connection
const connect = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
};

// Middleware
app.use(json());
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true, 
}));
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Employee Management System API');
});

//error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.listen(process.env.PORT, () => {
  connect();
  console.log("Connected to Employee Server");
});






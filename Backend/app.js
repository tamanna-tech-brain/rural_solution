import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from "mongoose"
import path from "path";

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import mandiRoutes from './routes/mandiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import translationRoutes from './routes/translationRoutes.js';
import helpRoutes from "./routes/helpRoutes.js";

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translate', translationRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/help", helpRoutes);

export default app;  
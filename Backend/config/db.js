import mongoose from 'mongoose';

const connectDB = async () => {
  // If already connected, reuse existing connection (crucial for serverless & HMR)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
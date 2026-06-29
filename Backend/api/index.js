import connectDB from '../config/db.js';
import app from '../app.js';

// Connect to DB once when the serverless function starts
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  
  // Delegate the request to the Express app
  return app(req, res);
}

import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables before starting
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "PORT"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Unhandled rejection safety net
    process.on("unhandledRejection", (reason) => {
      console.error("❌ Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
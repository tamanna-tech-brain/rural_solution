import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createMandi,
  getMandi,
  getMandiById,
  updateMandi,
  deleteMandi,
  updateMandiStatus,
  updateDriverLocation,
  joinMandi,
} from "../controllers/mandiController.js";

const router = express.Router();

// Public
router.get("/", getMandi);
router.get("/:id", getMandiById);

// Protected
router.post("/", authMiddleware, createMandi);
router.put("/:id", authMiddleware, updateMandi);
router.delete("/:id", authMiddleware, deleteMandi);
router.put("/:id/status", authMiddleware, updateMandiStatus);
router.put("/:id/location", authMiddleware, updateDriverLocation);
router.post("/:id/join", authMiddleware, joinMandi); // NEW: join a mandi pool

export default router;
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
} from "../controllers/mandiController.js";

const router = express.Router();

router.post("/", authMiddleware, createMandi);
router.get("/", authMiddleware, getMandi);
router.get("/:id", authMiddleware, getMandiById);

router.put("/:id", authMiddleware, updateMandi);
router.delete("/:id", authMiddleware, deleteMandi);
router.put("/:id", authMiddleware, updateMandi);
router.put("/:id/status", authMiddleware, updateMandiStatus);
router.put("/:id/location", authMiddleware, updateDriverLocation);

router.put("/:id/location", authMiddleware, updateDriverLocation);

export default router;
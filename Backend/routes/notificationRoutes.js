import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE
router.post("/", authMiddleware, createNotification);

// READ (ANYONE LOGGED IN)
router.get("/", authMiddleware, getNotifications);

// MARK READ
router.put("/:id", authMiddleware, markAsRead);

// UPDATE (OWNER ONLY)
router.patch("/:id", authMiddleware, updateNotification);

// DELETE (OWNER ONLY)
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
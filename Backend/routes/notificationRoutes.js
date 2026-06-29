import express from "express";
import Notification from "../models/Notification.js";
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes require auth
router.use(authMiddleware);

// CREATE
router.post("/", createNotification);

// GET my notifications
router.get("/", getNotifications);

// MARK ALL as read — must come before /:id
router.put("/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// MARK SINGLE as read  /:id/read
router.put("/:id/read", markAsRead);

// DELETE
router.delete("/:id", deleteNotification);

export default router;
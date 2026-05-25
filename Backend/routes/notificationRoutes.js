import express from "express";

import {
  createNotification,
  getNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification);

router.get("/", getNotifications);

router.put("/:id", markAsRead);

export default router;
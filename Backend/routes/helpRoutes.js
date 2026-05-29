import express from "express";
import {
  createHelpPost,
  getUserHelpPosts,
  getAllHelpPosts,
  replyHelpPost,
  resolveHelpPost,
  deleteHelpPost,
} from "../controllers/helpController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// USER
router.post("/", authMiddleware, createHelpPost);
router.get("/my", authMiddleware, getUserHelpPosts);

// ADMIN
router.get("/", authMiddleware, adminMiddleware, getAllHelpPosts);
router.put("/reply/:id", authMiddleware, adminMiddleware, replyHelpPost);
router.put("/resolve/:id", authMiddleware, adminMiddleware, resolveHelpPost);
router.delete("/:id", authMiddleware, adminMiddleware, deleteHelpPost);

export default router;
import express from "express";
import {
  createHelpPost,
  getAllHelpPosts,
  replyHelpPost,
  resolveHelpPost,
  deleteHelpPost,
} from "../controllers/helpController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all help posts — open to all logged-in users (admin filter removed so farmers can see)
router.get("/", authMiddleware, getAllHelpPosts);

// CREATE — any logged-in user
router.post("/", authMiddleware, createHelpPost);

// REPLY — any logged-in user (or restrict to admin in production)
router.put("/reply/:id", authMiddleware, replyHelpPost);

// RESOLVE
router.put("/resolve/:id", authMiddleware, resolveHelpPost);

// DELETE — auth required (controller checks ownership)
router.delete("/:id", authMiddleware, deleteHelpPost);

export default router;
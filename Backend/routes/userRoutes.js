import express from "express";

import {
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);

router.get("/:id", authMiddleware, getSingleUser);

router.put("/:id", authMiddleware,  upload.single("profileImage"), updateUser);

router.delete("/:id", authMiddleware, deleteUser);

export default router;
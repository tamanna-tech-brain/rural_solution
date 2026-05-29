import express from "express";

import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} from "../controllers/equipmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);

// PROTECTED
router.post(
  "/",
  authMiddleware,
  upload.single("equipmentImage"),
  createEquipment
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("equipmentImage"),
  updateEquipment
);

router.delete(
  "/:id",
  authMiddleware,
  deleteEquipment
);

export default router;
import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment
} from "../controllers/equipmentController.js";

const router = express.Router();

router.post("/", createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
import express from "express";
import {
  createMandi,
  getMandi,
  getMandiById,
  updateMandi,
  deleteMandi,
} from "../controllers/mandiController.js";

const router = express.Router();

router.post("/", createMandi);
router.get("/", getMandi);
router.get("/:id", getMandiById);
router.put("/:id", updateMandi);
router.delete("/:id", deleteMandi);

export default router;
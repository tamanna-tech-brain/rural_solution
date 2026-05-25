import express from "express";

import {
  createDispute,
  getDisputes,
  resolveDispute,
} from "../controllers/disputeController.js";

const router = express.Router();

router.post("/", createDispute);

router.get("/", getDisputes);

router.put("/:id", resolveDispute);

export default router;
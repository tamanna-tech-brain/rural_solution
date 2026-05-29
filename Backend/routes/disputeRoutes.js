import express from "express";

import {
  createDispute,
  getDisputes,
  updateDispute,
  resolveDispute,
  deleteDispute,
} from "../controllers/disputeController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import { isDisputeOwner } from "../middleware/isDisputeOwner.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  authMiddleware,
  createDispute
);

// GET ALL
router.get(
  "/",
  authMiddleware,
  getDisputes
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  isDisputeOwner,
  updateDispute
);

// RESOLVE
router.put(
  "/:id/resolve",
  authMiddleware,
  isDisputeOwner,
  resolveDispute
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  isDisputeOwner,
  deleteDispute
);

export default router;
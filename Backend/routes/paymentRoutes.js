import express from "express";
import {
  createPayment,
  getPayments,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { isPaymentOwner } from "../middleware/paymentmiddleware.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  authMiddleware,
  upload.single("paymentScreenshot"),
  createPayment
);

// GET ALL
router.get("/", authMiddleware, getPayments);

// UPDATE (OWNER ONLY)
router.put(
  "/:id",
  authMiddleware,
  isPaymentOwner,
  upload.single("paymentScreenshot"),
  updatePayment
);

// DELETE (OWNER ONLY)
router.delete("/:id", authMiddleware, isPaymentOwner, deletePayment);

export default router;
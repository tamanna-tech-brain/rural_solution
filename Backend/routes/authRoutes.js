import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
} from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.post(
  "/register",
  upload.single("profileImage"),
  register
);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendVerificationOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

export default router;
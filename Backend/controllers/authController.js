import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { otpEmailTemplate, welcomeEmailTemplate } from "../utils/emailTemplates.js";

let devTransporter;

const createTransporter = async () => {
  if (
    process.env.MAIL_HOST &&
    process.env.MAIL_USER &&
    process.env.MAIL_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT
        ? Number(process.env.MAIL_PORT)
        : 587,
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  if (!devTransporter) {
    const testAccount = await nodemailer.createTestAccount();

    devTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return devTransporter;
};

const sendOtpEmail = async (user, type = "Verification") => {
  const transporter = await createTransporter();

  const otp = String(Math.floor(100000 + Math.random() * 900000));

  if (type === "Verification" || type === "Login") {
    user.emailVerificationCode = otp;
    user.emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  } else if (type === "Password Reset") {
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  }

  await user.save();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: user.email,
    subject: `Your KrishiPool ${type} Code`,
    html: otpEmailTemplate(otp, type),
  });
};

const sendWelcomeEmail = async (user) => {
  const transporter = await createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: user.email,
    subject: "Welcome to KrishiPool! 🌱",
    html: welcomeEmailTemplate(user.name),
  });
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET + "_refresh",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

//
// REGISTER
//
export const register = async (req, res) => {
  try {
    const { name, email, phone, village, region, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      village,
      region,
      password: hashedPassword,
    });

    await sendOtpEmail(user, "Verification");

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully to email",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//
// LOGIN
//
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Always send OTP for security (2FA)
    await sendOtpEmail(user, "Login");

    return res.json({
      success: true,
      message: "OTP sent to email. Please verify to login.",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//
// VERIFY OTP (Login / Register verification)
//
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emailVerificationCode || user.emailVerificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== user.emailVerificationCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const wasUnverified = !user.verified;

    // CLEAR OTP AND MARK VERIFIED
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.verified = true;

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;

    await user.save();

    if (wasUnverified) {
      await sendWelcomeEmail(user);
    }

    // Set Refresh Token as HTTP-Only cookie for extra security
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: "Verification successful",
      token: accessToken,
      refreshToken, // Also sent in JSON for SPA convenience
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//
// REFRESH TOKEN
//
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(token, process.env.JWT_SECRET + "_refresh", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Refresh token expired" });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
      
      user.refreshToken = newRefreshToken;
      user.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true, token: accessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//
// RESEND OTP
//
export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendOtpEmail(user, "Verification");

    return res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//
// FORGOT PASSWORD
//
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendOtpEmail(user, "Password Reset");

    return res.json({ success: true, message: "Password reset OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//
// RESET PASSWORD
//
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== user.resetPasswordOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
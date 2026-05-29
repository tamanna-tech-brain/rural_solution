import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

const sendOtpEmail = async (user) => {
  const transporter = await createTransporter();

  const otp = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  user.emailVerificationCode = otp;
  user.emailVerificationCodeExpires =
    new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: user.email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
    html: `<h2>Your OTP is ${otp}</h2>`,
  });
};

//
// REGISTER
//
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      village,
      region,
      password,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
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

    await sendOtpEmail(user);

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // SEND OTP EVERY LOGIN
    await sendOtpEmail(user);

    return res.json({
      success: true,
      message: "OTP sent to email",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//
// VERIFY OTP
//
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !user.emailVerificationCode ||
      user.emailVerificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otp !== user.emailVerificationCode) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // CLEAR OTP
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;

    await user.save();

    // GENERATE TOKEN AFTER OTP VERIFY
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Verification successful",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    await sendOtpEmail(user);

    return res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
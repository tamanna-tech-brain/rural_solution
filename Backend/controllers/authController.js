import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

let devTransporter;

const createTransporter = async () => {
  if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS) {
    console.log("Email transport configured:", {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT || 587,
      secure: process.env.MAIL_SECURE === "true",
      user: process.env.MAIL_USER,
    });

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email transport is not configured");
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

const sendVerificationEmail = async (user) => {
  const transporter = await createTransporter();

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.emailVerificationCode = otp;
  user.emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER || "no-reply@example.com",
    to: user.email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });

  console.log("Verification email send result:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    previewUrl: nodemailer.getTestMessageUrl(info),
  });

  return nodemailer.getTestMessageUrl(info);
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, village, region } = req.body;

    if (!name || !email || !phone || !password || !village || !region) {
      return res.status(400).json({ message: "All Fields Required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      village,
      region,
      verified: false,
    });

    let previewUrl;
    try {
      previewUrl = await sendVerificationEmail(user);
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: `Registration failed: ${emailError.message}`,
      });
    }

    const response = {
      success: true,
      user,
      message: "Registration successful. Verification OTP sent to email.",
    };

    if (previewUrl) response.previewUrl = previewUrl;

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (user.verified) {
      return res.json({ success: true, message: "Email already verified" });
    }

    if (
      !user.emailVerificationCode ||
      !user.emailVerificationCodeExpires ||
      user.emailVerificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (otp !== user.emailVerificationCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.verified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (user.verified) {
      return res.json({ success: true, message: "Email already verified" });
    }

    const previewUrl = await sendVerificationEmail(user);

    const response = { success: true, message: "Verification OTP resent to email" };
    if (previewUrl) response.previewUrl = previewUrl;

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password Required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Check your inbox for the OTP.",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
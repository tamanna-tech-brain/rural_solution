import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: { type: String, required: true },

    village: { type: String, required: true },

    region: { type: String, required: true },

    trustScore: { type: Number, default: 5 },

    verified: { type: Boolean, default: false },

    emailVerificationCode: { type: String },
    emailVerificationCodeExpires: { type: Date },

    language: { type: String, default: "hi" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
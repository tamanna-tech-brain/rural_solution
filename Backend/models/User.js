import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    village: {
      type: String,
      required: true,
      trim: true,
    },

    region: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    trustScore: {
      type: Number,
      default: 5,
      min: 0,
      max: 10,
    },

    // Role-based access
    role: {
      type: String,
      enum: ["farmer", "admin"],
      default: "farmer",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerificationCode: { type: String },
    emailVerificationCodeExpires: { type: Date },

    language: {
      type: String,
      default: "hi",
    },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ region: 1 });

export default mongoose.model("User", userSchema);
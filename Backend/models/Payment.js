import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "disputed",
      ],
      default: "pending",
    },

    // IMPORTANT
    paymentType: {
      type: String,
      enum: ["Equipment", "Mandi"],
      required: true,
    },

    // EQUIPMENT PAYMENT
    equipmentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // MANDI PAYMENT
    mandiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MandiPool",
      default: null,
    },

    paymentScreenshot: {
      type: String,
      default: "",
    },

    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

export default Payment;
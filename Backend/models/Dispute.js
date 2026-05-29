import mongoose from "mongoose";

const disputeSchema =
  new mongoose.Schema(
    {
      raisedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      against: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      bookingType: {
        type: String,
        enum: [
          "Equipment",
          "Mandi",
        ],
        required: true,
      },

      bookingId: {
        type:
          mongoose.Schema.Types.ObjectId,
        refPath: "bookingModel",
        default: null,
      },

      bookingModel: {
        type: String,
        enum: [
          "Booking",
          "MandiPool",
        ],
      },

      reason: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "open",
          "resolved",
        ],
        default: "open",
      },
    },
    {
      timestamps: true,
    }
  );

// AUTO MODEL SET
disputeSchema.pre(
  "save",
  function (next) {
    if (
      this.bookingType ===
      "Equipment"
    ) {
      this.bookingModel =
        "Booking";
    }

    if (
      this.bookingType ===
      "Mandi"
    ) {
      this.bookingModel =
        "MandiPool";
    }

    next();
  }
);

export default mongoose.model(
  "Dispute",
  disputeSchema
);
import Dispute from "../models/Dispute.js";

// CREATE
export const createDispute = async (
  req,
  res
) => {
  try {
    const dispute =
      await Dispute.create({
        raisedBy: req.user.id,

        against:
          req.body.against,

        bookingType:
          req.body.bookingType,

        bookingId:
          req.body.bookingId,

        bookingModel:
          req.body.bookingType ===
          "Mandi"
            ? "MandiPool"
            : "Booking",

        reason: req.body.reason,
      });

    const populated =
      await Dispute.findById(
        dispute._id
      )
        .populate(
          "raisedBy",
          "name email"
        )
        .populate(
          "against",
          "name email"
        )
        .populate("bookingId");

    res.status(201).json(
      populated
    );
  } catch (error) {
    console.log(
      "CREATE DISPUTE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
export const getDisputes = async (
  req,
  res
) => {
  try {
    const disputes =
      await Dispute.find()
        .populate(
          "raisedBy",
          "name email"
        )
        .populate(
          "against",
          "name email"
        )
        .populate("bookingId");

    res.json(disputes);
  } catch (error) {
    console.log(
      "GET DISPUTES ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE
export const updateDispute = async (
  req,
  res
) => {
  try {
    const dispute =
      await Dispute.findById(
        req.params.id
      );

    if (!dispute) {
      return res.status(404).json({
        message:
          "Dispute not found",
      });
    }

    const ownerId =
      dispute.raisedBy?._id ||
      dispute.raisedBy;

    if (
      ownerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    dispute.against =
      req.body.against;

    dispute.bookingType =
      req.body.bookingType;

    dispute.bookingId =
      req.body.bookingId;

    dispute.bookingModel =
      req.body.bookingType ===
      "Mandi"
        ? "MandiPool"
        : "Booking";

    dispute.reason =
      req.body.reason;

    const updated =
      await dispute.save();

    const populated =
      await Dispute.findById(
        updated._id
      )
        .populate(
          "raisedBy",
          "name email"
        )
        .populate(
          "against",
          "name email"
        )
        .populate("bookingId");

    res.json(populated);
  } catch (error) {
    console.log(
      "UPDATE DISPUTE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// RESOLVE
export const resolveDispute =
  async (req, res) => {
    try {
      const dispute =
        await Dispute.findById(
          req.params.id
        );

      if (!dispute) {
        return res.status(404).json({
          message:
            "Dispute not found",
        });
      }

      const ownerId =
        dispute.raisedBy?._id ||
        dispute.raisedBy;

      if (
        ownerId.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "Not allowed",
        });
      }

      dispute.status =
        "resolved";

      await dispute.save();

      res.json({
        message:
          "Dispute resolved",
      });
    } catch (error) {
      console.log(
        "RESOLVE DISPUTE ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// DELETE
export const deleteDispute = async (
  req,
  res
) => {
  try {
    const dispute =
      await Dispute.findById(
        req.params.id
      );

    if (!dispute) {
      return res.status(404).json({
        message:
          "Dispute not found",
      });
    }

    const ownerId =
      dispute.raisedBy?._id ||
      dispute.raisedBy;

    if (
      ownerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await Dispute.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Dispute deleted",
    });
  } catch (error) {
    console.log(
      "DELETE DISPUTE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
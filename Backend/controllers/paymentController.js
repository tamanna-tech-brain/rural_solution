import Payment from "../models/Payment.js";
import mongoose from "mongoose";
export const createPayment = async (req, res) => {
  try {
    // AUTH CHECK
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // IMAGE
    if (req.file) {
      req.body.paymentScreenshot =
        req.file.path;
    }

    // VALIDATION
    if (
      req.body.paymentType ===
        "Equipment" &&
      !req.body.equipmentBookingId
    ) {
      return res.status(400).json({
        message:
          "Equipment booking required",
      });
    }

    if (
      req.body.paymentType ===
        "Mandi" &&
      !req.body.mandiId
    ) {
      return res.status(400).json({
        message: "Mandi trip required",
      });
    }

    const payment = await Payment.create({
      createdBy: req.user.id,

      payerId: req.body.payerId,

      payeeId: req.body.payeeId,

      amount: Number(req.body.amount),

      status:
        req.body.status || "pending",

      paymentType:
        req.body.paymentType,

      equipmentBookingId:
        req.body.paymentType ===
        "Equipment"
          ? req.body
              .equipmentBookingId
          : null,

      mandiId:
        req.body.paymentType ===
        "Mandi"
          ? req.body.mandiId
          : null,

      paymentScreenshot:
        req.body.paymentScreenshot ||
        "",
    });

    const populated =
      await Payment.findById(
        payment._id
      )
        .populate("createdBy", "name")
        .populate("payerId", "name")
        .populate("payeeId", "name")
        .populate(
          "equipmentBookingId"
        )
        .populate("mandiId");

    res.status(201).json(populated);
  } catch (error) {
    console.log(
      "PAYMENT CREATE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("createdBy", "name")
      .populate("payerId", "name")
      .populate("payeeId", "name")
      .populate("equipmentBookingId")
      .populate("mandiId");

    res.json(payments);
  } catch (error) {
    console.log("GET PAYMENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const updatePayment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // VALID ID
    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid Payment ID",
      });
    }

    // FIND PAYMENT
    const payment =
      await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // AUTH CHECK
    const creatorId =
      payment.createdBy?._id ||
      payment.createdBy;

    if (
      creatorId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    // IMAGE
    if (req.file) {
      req.body.paymentScreenshot =
        req.file.path;
    }

    // SAFE UPDATE DATA
    const updateData = {
      payerId:
        req.body.payerId ||
        payment.payerId,

      payeeId:
        req.body.payeeId ||
        payment.payeeId,

      amount:
        Number(req.body.amount) ||
        payment.amount,

      status:
        req.body.status ||
        payment.status,

      paymentType:
        req.body.paymentType ||
        payment.paymentType,

      equipmentBookingId:
        req.body.equipmentBookingId ||
        null,

      mandiId:
        req.body.mandiId || null,
    };

    // KEEP OLD IMAGE
    if (
      req.body.paymentScreenshot
    ) {
      updateData.paymentScreenshot =
        req.body.paymentScreenshot;
    } else {
      updateData.paymentScreenshot =
        payment.paymentScreenshot;
    }

    // UPDATE
    const updated =
      await Payment.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("createdBy", "name")
        .populate("payerId", "name")
        .populate("payeeId", "name")
        .populate(
          "equipmentBookingId"
        )
        .populate("mandiId");

    res.json(updated);
  } catch (error) {
    console.log(
      "UPDATE PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};  


export const deletePayment = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findById(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const creatorId =
  payment.createdBy?._id ||
  payment.createdBy;

if (
  creatorId.toString() !==
  req.user.id
) {
  return res.status(403).json({
    message: "Not allowed",
  });
}

    await Payment.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Payment Deleted",
    });
  } catch (error) {
    console.log(
      "DELETE PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
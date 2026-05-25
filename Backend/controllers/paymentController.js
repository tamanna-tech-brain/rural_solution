import Payment from "../models/Payment.js";

// CREATE
export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Payment Failed", error });
  }
};

// GET ALL
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("payerId")
      .populate("payeeId");

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed To Fetch Payments" });
  }
};

// UPDATE (FIXED → full update)
export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed To Update Payment" });
  }
};

// DELETE (MISSING BEFORE → FIXED)
export const deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed To Delete Payment" });
  }
};


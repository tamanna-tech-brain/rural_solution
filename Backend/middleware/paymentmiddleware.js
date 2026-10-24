import Payment from "../models/Payment.js";

export const isPaymentOwner = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const userId = req.user.id || req.user._id;
    if (payment.createdBy.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
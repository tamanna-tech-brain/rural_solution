export const isPaymentOwner = async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) return res.status(404).json({ message: "Not found" });

  if (payment.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not allowed" });
  }

  next();
};
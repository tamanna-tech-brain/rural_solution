import Dispute from "../models/Dispute.js";

export const isDisputeOwner = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    const userId = req.user.id || req.user._id;
    if (dispute.raisedBy.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    req.dispute = dispute;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
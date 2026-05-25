import Dispute from "../models/Dispute.js";

export const createDispute = async (req, res) => {
  try {
    const dispute = await Dispute.create(req.body);
    return res.status(201).json(dispute);
  } catch (error) {
    console.log("CREATE DISPUTE ERROR:", error);
    return res.status(500).json({
      message: "Failed To Create Dispute",
      error: error.message,
    });
  }
};

export const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("raisedBy", "name email")
      .populate("against", "name email");

    return res.json(disputes);
  } catch (error) {
    console.log("GET DISPUTES ERROR:", error);
    return res.status(500).json({
      message: "Failed To Fetch Disputes",
      error: error.message,
    });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    return res.json(dispute);
  } catch (error) {
    console.log("RESOLVE DISPUTE ERROR:", error);
    return res.status(500).json({
      message: "Failed To Resolve Dispute",
      error: error.message,
    });
  }
};
import Notification from "../models/Notification.js";

// CREATE
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed To Create Notification" });
  }
};

// GET MY NOTIFICATIONS (logged-in user only)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed To Fetch Notifications" });
  }
};

// MARK AS READ (ANY USER CAN DO)
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed To Update Notification" });
  }
};

// UPDATE (ONLY OWNER)
export const updateNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // OWNER CHECK
    if (notif.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed To Update Notification" });
  }
};

// DELETE (ONLY OWNER)
export const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notif.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed To Delete Notification" });
  }
};
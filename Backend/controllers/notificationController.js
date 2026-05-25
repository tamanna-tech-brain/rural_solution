import Notification from "../models/Notification.js";
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);

     await textToSpeech(notification.message);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed To Create Notification",
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("userId");

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed To Fetch Notifications",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed To Update Notification",
    });
  }
};
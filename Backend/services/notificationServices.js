import Notification from "../models/Notification.js";

export const sendNotification = async (
  userId,
  message,
  type
) => {
  return await Notification.create({
    userId,
    message,
    type,
  });
};
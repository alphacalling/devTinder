const Notification = require("../models/notificationModel");

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit, 10) || 30;
    const unreadOnly = req.query.unread === "true";

    const query = { userId };
    if (unreadOnly) query.read = false;

    const list = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      data: list,
      unreadCount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const markRead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const notif = await Notification.findOne({ _id: id, userId });
    if (!notif) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    notif.read = true;
    await notif.save();

    return res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const markAllRead = async (req, res) => {
  try {
    const { userId } = req.user;

    await Notification.updateMany({ userId, read: false }, { read: true });

    return res.status(200).json({
      success: true,
      message: "All marked as read",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};

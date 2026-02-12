require("dotenv").config();
const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const connectionRequestModel = require("../models/connectionModel");
const userSchema = require("../models/userModel");

// Get list of conversations (accepted connections with last message)
const getConversations = async (req, res) => {
  try {
    const { userId } = req.user;

    const accepted = await connectionRequestModel
      .find({
        $or: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      })
      .lean()
      .exec();

    const otherUserIds = accepted.map((c) =>
      c.senderId.toString() === userId.toString()
        ? c.receiverId
        : c.senderId
    );

    if (otherUserIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No conversations yet",
        data: [],
      });
    }

    const users = await userSchema
      .find({ _id: { $in: otherUserIds } })
      .select("userName photoUrl age")
      .lean()
      .exec();

    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});

    const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const otherIds = otherUserIds.map((id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id));

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: uid, receiverId: { $in: otherIds } },
            { receiverId: uid, senderId: { $in: otherIds } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", uid] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    const lastByOther = lastMessages.reduce((acc, m) => {
      acc[m._id.toString()] = m.lastMessage;
      return acc;
    }, {});

    const conversations = otherUserIds.map((id) => {
      const uid = id.toString();
      const user = userMap[uid];
      if (!user) return null;
      const last = lastByOther[uid];
      return {
        user: {
          _id: user._id,
          userName: user.userName,
          photoUrl: user.photoUrl,
          age: user.age,
        },
        lastMessage: last
          ? {
              text: last.text,
              createdAt: last.createdAt,
              sentByMe: last.senderId.toString() === userId.toString(),
            }
          : null,
      };
    }).filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Conversations fetched",
      data: conversations,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// Get messages with a specific user (paginated)
const getMessages = async (req, res) => {
  try {
    const { userId } = req.user;
    const { otherUserId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    const connection = await connectionRequestModel.findOne({
      $or: [
        { senderId: userId, receiverId: otherUserId, status: "accepted" },
        { senderId: otherUserId, receiverId: userId, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with accepted connections",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const reversed = messages.reverse();

    return res.status(200).json({
      success: true,
      message: "Messages fetched",
      data: reversed,
      meta: { page, limit, hasMore: messages.length === limit },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
};

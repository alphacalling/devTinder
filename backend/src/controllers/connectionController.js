require("dotenv").config();
const mongoose = require("mongoose");
const userSchema = require("../models/userModel");
const connectionRequestModel = require("../models/connectionModel");
const Profile = require("../models/profileModel");
const Notification = require("../models/notificationModel");

/*
  CONNECTION FLOW:
  - I send "interested" → other user sees it in Pending (for you); I see it in Pending (sent).
  - When they Accept → status becomes "accepted" → request leaves both Pending lists and appears in Accepted for both.
  - When they Reject → status becomes "rejected" → request leaves Pending (for you) and Pending (sent).
*/

// Normalize current user id from JWT
const getCurrentUserId = (req) => {
  const raw = req.user?.userId ?? req.user?.id;
  if (!raw) return null;
  return mongoose.Types.ObjectId.isValid(raw)
    ? new mongoose.Types.ObjectId(raw)
    : raw;
};

// Send connection request (interested / ignored)
const connectionRequest = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { receiverId, requestStatus } = req.params;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (!["ignored", "interested"].includes(requestStatus)) {
      return res.status(400).json({
        success: false,
        message: "Use interested or ignored",
      });
    }
    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide receiverId" });
    }

    const findUser = await userSchema.findById(receiverId);
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (userId.toString() === receiverId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot send request to yourself",
        });
    }

    // Already sent by me → block
    const sentByMe = await connectionRequestModel.findOne({
      senderId: userId,
      receiverId,
    });
    if (sentByMe) {
      return res.status(400).json({
        success: false,
        message: "Request already sent",
      });
    }

    // They already sent "interested" to me → no duplicate; they are in my Pending (for you)
    const sentToMe = await connectionRequestModel.findOne({
      senderId: receiverId,
      receiverId: userId,
      status: "interested",
    });
    if (sentToMe) {
      return res.status(200).json({
        success: true,
        alreadyReceived: true,
        message:
          "They already sent you a request. Accept or reject in Pending (for you).",
        requestId: sentToMe._id,
      });
    }

    // Create new request → they will see it in Pending (for you), I in Pending (sent)
    const newRequest = new connectionRequestModel({
      senderId: userId,
      receiverId,
      status: requestStatus,
    });
    const savedRequest = await newRequest.save();
    await savedRequest.populate("receiverId", [
      "userName",
      "photoUrl",
      "gender",
    ]);

    if (requestStatus === "interested") {
      const sender = await userSchema
        .findById(userId)
        .select("userName")
        .lean();
      const notif = new Notification({
        userId: receiverId,
        type: "connection_request",
        fromUserId: userId,
        fromUserName: sender?.userName,
        message: `${sender?.userName || "Someone"} wants to connect`,
        meta: { requestId: savedRequest._id },
      });
      await notif.save();
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${receiverId}`).emit("notification", {
          _id: notif._id,
          type: "connection_request",
          fromUserId: String(userId),
          fromUserName: notif.fromUserName,
          message: notif.message,
          createdAt: notif.createdAt,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Request sent to ${findUser.userName}`,
      data: savedRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// Accept or Reject a request (only for requests that are currently "interested")
// After accept → request leaves Pending (for you) and Pending (sent), appears in Accepted for both
const connectionReview = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { senderId, requestStatus } = req.params;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (!senderId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide sender Id" });
    }
    if (!["accepted", "rejected"].includes(requestStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Use accepted or rejected" });
    }

    const findUser = await userSchema.findById(senderId);
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Request must be: they sent to me (I am receiver), and still "interested"
    const findRequest = await connectionRequestModel.findOne({
      senderId,
      receiverId: userId,
      status: "interested",
    });

    if (!findRequest) {
      return res.status(404).json({
        success: false,
        message: "No pending request from this user",
      });
    }

    findRequest.status = requestStatus;
    await findRequest.save();

    const notif = new Notification({
      userId: senderId,
      type:
        requestStatus === "accepted"
          ? "connection_accepted"
          : "connection_rejected",
      fromUserId: userId,
      fromUserName: findUser?.userName,
      message:
        requestStatus === "accepted"
          ? `${findUser?.userName || "Someone"} accepted your request`
          : `${findUser?.userName || "Someone"} declined your request`,
      meta: { requestId: findRequest._id },
    });
    await notif.save();
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${senderId}`).emit("notification", {
        _id: notif._id,
        type: notif.type,
        fromUserId: String(userId),
        fromUserName: notif.fromUserName,
        message: notif.message,
        createdAt: notif.createdAt,
      });
    }

    const connectionRequest = await connectionRequestModel
      .findOne({ _id: findRequest._id })
      .populate("receiverId", ["userName", "photoUrl", "gender"]);

    return res.status(200).json({
      success: true,
      message: `You have ${requestStatus} the connection request from ${findUser.userName}`,
      data: connectionRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// Pending (for you): requests where someone sent "interested" to me → I can Accept/Reject
const getPendingReceived = async (req, res) => {
  try {
    const receiverId = getCurrentUserId(req);
    if (!receiverId) {
      return res
        .status(401)
        .json({ success: false, message: "User id not found" });
    }
    const findRequests = await connectionRequestModel
      .find({ receiverId, status: "interested" })
      .sort({ createdAt: -1 })
      .populate("senderId", [
        "userName",
        "photoUrl",
        "gender",
        "age",
        "about",
        "location",
        "skills",
      ])
      .lean();
    const list = findRequests
      .filter((r) => r.senderId)
      .map((r) => ({
        ...r.senderId,
        _id: r.senderId._id,
        requestId: r._id,
      }));
    // (same user should not appear twice)
    const seen = new Set();
    const deduped = list.filter((item) => {
      const id = item._id?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return res.status(200).json({
      success: true,
      message:
        deduped.length === 0
          ? "No pending requests"
          : "Pending requests fetched",
      data: deduped,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// Pending (sent): requests I sent with status "interested" → when they accept, these move to Accepted
const getPendingSent = async (req, res) => {
  try {
    const senderId = getCurrentUserId(req);
    if (!senderId) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    const findRequests = await connectionRequestModel
      .find({ senderId, status: "interested" })
      .sort({ createdAt: -1 })
      .populate("receiverId", [
        "userName",
        "photoUrl",
        "gender",
        "age",
        "about",
        "location",
        "skills",
      ])
      .lean();
    const list = findRequests
      .filter((r) => r.receiverId)
      .map((r) => ({
        ...r.receiverId,
        _id: r.receiverId._id,
        requestId: r._id,
      }));
    // Dedupe by user _id
    const seenSent = new Set();
    const dedupedSent = list.filter((item) => {
      const id = item._id?.toString();
      if (!id || seenSent.has(id)) return false;
      seenSent.add(id);
      return true;
    });
    return res.status(200).json({
      success: true,
      message:
        dedupedSent.length === 0 ? "No pending sent" : "Pending sent fetched",
      data: dedupedSent,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// incoming interested
const getAllConnectionRequests = async (req, res) => {
  const { userId } = req.user;
  const findRequests = await connectionRequestModel
    .find({ receiverId: userId, status: "interested" })
    .sort({ createdAt: -1 })
    .populate("senderId", ["userName", "photoUrl", "gender"]);
  const list = findRequests.map((r) => ({
    ...r.senderId?.toObject?.(),
    _id: r.senderId?._id,
  }));
  return res.status(200).json({
    success: true,
    message:
      list.length === 0
        ? "No connection requests found"
        : "Connection requests fetched successfully",
    data: list,
  });
};

// Accepted: connections where status is "accepted" → show the other user for each
const getAllAcceptedRequests = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    const findRequest = await connectionRequestModel
      .find({
        $or: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      })
      .sort({ updatedAt: -1 })
      .populate("senderId", [
        "userName",
        "photoUrl",
        "gender",
        "age",
        "about",
        "location",
      ])
      .populate("receiverId", [
        "userName",
        "photoUrl",
        "gender",
        "age",
        "about",
        "location",
      ])
      .lean();
    const mappedRequests = findRequest.map((r) => {
      const other =
        r.senderId._id.toString() === userId.toString()
          ? r.receiverId
          : r.senderId;
      return other;
    });
    // (same connection should not show same user twice)
    const seenAccepted = new Set();
    const dedupedAccepted = mappedRequests.filter((item) => {
      const id = item?._id?.toString();
      if (!id || seenAccepted.has(id)) return false;
      seenAccepted.add(id);
      return true;
    });
    return res.status(200).json({
      success: true,
      message:
        dedupedAccepted.length === 0
          ? "No accepted connections found"
          : "Connection requests fetched successfully",
      data: dedupedAccepted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

//getAllrejected connection
const getRejectedConnection = async (req, res) => {
  try {
    const { userId } = req.user;
    const findConnection = await connectionRequestModel
      .find(
        {
          $or: [
            { senderId: userId, status: "rejected" },
            { receiverId: userId, status: "rejected" },
          ],
        },
        { status: "rejected" },
        { senderId: userId },
      )
      .populate("receiverId", ["userName", "photoUrl", "gender"]);
    return res.status(200).json({
      success: true,
      message:
        findConnection.length === 0
          ? "No rejected connections found"
          : "data fetched successfully",
      data: findConnection,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

//getFeedAPI - dating-style feed based on preferences & connections
const getConnectionFeed = async (req, res) => {
  try {
    const { userId } = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Current user's profile & preferences
    const viewerProfile = await Profile.findOne({ user: userId });

    // Exclude only accepted/rejected (already decided); show everyone else in feed
    // so new users and pending "interested" still appear
    const connections = await connectionRequestModel.find(
      {
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: { $in: ["accepted", "rejected"] },
      },
      "senderId receiverId",
    );

    const excludedUserIds = new Set();
    excludedUserIds.add(userId.toString());

    connections.forEach((conn) => {
      if (conn.senderId) excludedUserIds.add(conn.senderId.toString());
      if (conn.receiverId) excludedUserIds.add(conn.receiverId.toString());
    });

    const query = {
      _id: { $nin: Array.from(excludedUserIds) },
    };

    // Apply preference filters: include users who haven't set age/gender so new users appear for everyone
    if (viewerProfile && viewerProfile.preferences) {
      const { gender, minAge, maxAge } = viewerProfile.preferences;

      if (gender && gender !== "everyone") {
        query.$or = [
          { gender: { $exists: false } },
          { gender: null },
          { gender: "" },
          { gender },
        ];
      }

      if (minAge != null || maxAge != null) {
        const ageCond = {};
        if (minAge != null) ageCond.$gte = minAge;
        if (maxAge != null) ageCond.$lte = maxAge;
        if (Object.keys(ageCond).length) {
          query.$and = query.$and || [];
          query.$and.push({
            $or: [{ age: { $exists: false } }, { age: null }, { age: ageCond }],
          });
        }
      }
    }

    const candidates = await userSchema
      .find(query)
      .sort({ createdAt: -1 })
      .select("userName gender photoUrl age skills about location")
      .skip(skip)
      .limit(limit);

    const candidateIds = candidates.map((u) => u._id);

    const profiles = await Profile.find({ user: { $in: candidateIds } })
      .lean()
      .exec();

    const profileByUser = profiles.reduce((acc, prof) => {
      acc[prof.user.toString()] = prof;
      return acc;
    }, {});

    const feed = candidates.map((user) => {
      const profile = profileByUser[user._id.toString()];
      return {
        _id: user._id,
        userName: user.userName,
        age: user.age,
        gender: user.gender,
        location: user.location,
        about: user.about,
        photoUrl: user.photoUrl,
        skills: user.skills,
        profile: profile
          ? {
              tagline: profile.tagline,
              bio: profile.bio,
              interests: profile.interests,
              relationshipGoal: profile.relationshipGoal,
              jobTitle: profile.jobTitle,
              company: profile.company,
              education: profile.education,
              hometown: profile.hometown,
              preferences: profile.preferences,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Connection feed fetched successfully",
      data: feed,
      meta: {
        page,
        limit,
        hasMore: feed.length === limit,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// nearby connections within radius (km) based on profile.geoLocation
const getNearbyConnections = async (req, res) => {
  try {
    const { userId } = req.user;
    const radiusKm = parseFloat(req.query.radiusKm) || 5;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const viewerProfile = await Profile.findOne({ user: userId });

    if (
      !viewerProfile ||
      !viewerProfile.geoLocation ||
      !Array.isArray(viewerProfile.geoLocation.coordinates) ||
      viewerProfile.geoLocation.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Your location is not set. Please update your profile with latitude and longitude.",
      });
    }

    // Exclude self and already-connected users
    const connections = await connectionRequestModel.find(
      {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
      "senderId receiverId",
    );

    const excludedUserIds = new Set();
    excludedUserIds.add(userId.toString());

    connections.forEach((conn) => {
      if (conn.senderId) excludedUserIds.add(conn.senderId.toString());
      if (conn.receiverId) excludedUserIds.add(conn.receiverId.toString());
    });

    const radiusInRadians = radiusKm / 6378.1; // Earth radius in km

    const nearbyProfiles = await Profile.find({
      user: { $nin: Array.from(excludedUserIds) },
      geoLocation: {
        $geoWithin: {
          $centerSphere: [
            viewerProfile.geoLocation.coordinates,
            radiusInRadians,
          ],
        },
      },
    })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    if (!nearbyProfiles.length) {
      return res.status(200).json({
        success: true,
        message: "No nearby connections found",
        data: [],
        meta: {
          page,
          limit,
          hasMore: false,
        },
      });
    }

    const candidateIds = nearbyProfiles.map((p) => p.user);

    const candidates = await userSchema
      .find({ _id: { $in: candidateIds } })
      .select("userName gender photoUrl age skills about location")
      .lean()
      .exec();

    const userById = candidates.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const feed = nearbyProfiles
      .map((profile) => {
        const user = userById[profile.user.toString()];
        if (!user) return null;
        return {
          _id: user._id,
          userName: user.userName,
          age: user.age,
          gender: user.gender,
          location: user.location,
          about: user.about,
          photoUrl: user.photoUrl,
          skills: user.skills,
          profile: {
            tagline: profile.tagline,
            bio: profile.bio,
            interests: profile.interests,
            relationshipGoal: profile.relationshipGoal,
            jobTitle: profile.jobTitle,
            company: profile.company,
            education: profile.education,
            hometown: profile.hometown,
            preferences: profile.preferences,
          },
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Nearby connections fetched successfully",
      data: feed,
      meta: {
        page,
        limit,
        hasMore: feed.length === limit,
        radiusKm,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

module.exports = {
  connectionRequest,
  connectionReview,
  getAllConnectionRequests,
  getPendingReceived,
  getPendingSent,
  getAllAcceptedRequests,
  getRejectedConnection,
  getConnectionFeed,
  getNearbyConnections,
};

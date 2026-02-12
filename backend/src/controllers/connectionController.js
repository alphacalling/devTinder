require("dotenv").config();
const userSchema = require("../models/userModel");
const connectionRequestModel = require("../models/connectionModel");
const Profile = require("../models/profileModel");

// sending connection requests to another user
const connectionRequest = async (req, res) => {
  try {
    const { userId } = req.user;
    const { receiverId, requestStatus } = req.params;

    // validation in status field
    const values = ["ignored", "interested", "accepted", "rejected"];
    if (!values.includes(requestStatus)) {
      return res.status(400).json({
        success: false,
        message: `${requestStatus} is incorrect status`,
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Please provide receiverId",
      });
    }
    // checking if receiver exists
    const findUser = await userSchema.findById(receiverId);
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }
    // if sender is equal to receiver
    if (userId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }
    // if any request sent already
    const findRequest = await connectionRequestModel.findOne({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    });
    if (findRequest) {
      return res.status(400).json({
        success: false,
        message: "Request already sent",
      });
    }
    // sending new request to receiverId
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

    return res.status(200).json({
      success: true,
      message: `You sent connection request to ${findUser.userName}`,
      data: savedRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// accepting or rejecting requsts
const connectionReview = async (req, res) => {
  try {
    const { userId } = req.user;
    // console.log(userId, userName);

    const { senderId, requestStatus } = req.params;
    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "Please provide sender Id",
      });
    }
    const requestedValue = ["accepted", "rejected"];
    if (!requestedValue.includes(requestStatus)) {
      return res.status(400).json({
        success: false,
        message: `${requestStatus} is incorrect status`,
      });
    }
    const findUser = await userSchema.findById(senderId);
    if (findUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }

    const findRequest = await connectionRequestModel.findOne({
      $or: [
        { senderId: userId, receiverId: senderId },
        { senderId: senderId, receiverId: userId },
      ],
    });

    if (!findRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found in Database",
      });
    }
    // if (findRequest.status === "accepted") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Request already accepted",
    //   });
    // }
    // save the connection request
    findRequest.status = requestStatus;
    await findRequest.save();

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

// Incoming: requests where someone sent "interested" to me (I am receiver)
const getPendingReceived = async (req, res) => {
  try {
    const { userId } = req.user;
    const findRequests = await connectionRequestModel
      .find({ receiverId: userId, status: "interested" })
      .sort({ createdAt: -1 })
      .populate("senderId", ["userName", "photoUrl", "gender", "age", "about"]);
    const list = findRequests.map((r) => ({
      ...r.senderId?.toObject?.(),
      _id: r.senderId?._id,
      requestId: r._id,
    }));
    return res.status(200).json({
      success: true,
      message:
        list.length === 0
          ? "No pending requests"
          : "Pending requests fetched",
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// Sent: requests I sent with status "interested" (waiting for them to accept)
const getPendingSent = async (req, res) => {
  try {
    const { userId } = req.user;
    const findRequests = await connectionRequestModel
      .find({ senderId: userId, status: "interested" })
      .sort({ createdAt: -1 })
      .populate("receiverId", ["userName", "photoUrl", "gender", "age", "about"]);
    const list = findRequests.map((r) => ({
      ...r.receiverId?.toObject?.(),
      _id: r.receiverId?._id,
      requestId: r._id,
    }));
    return res.status(200).json({
      success: true,
      message:
        list.length === 0 ? "No pending sent" : "Pending sent fetched",
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// Legacy: incoming interested (keep same route name for compatibility)
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

// Accepted: return the "other" user for each accepted connection
const getAllAcceptedRequests = async (req, res) => {
  try {
    const { userId } = req.user;
    const findRequest = await connectionRequestModel
      .find({
        $or: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      })
      .sort({ updatedAt: -1 })
      .populate("senderId", ["userName", "photoUrl", "gender", "age", "about", "location"])
      .populate("receiverId", ["userName", "photoUrl", "gender", "age", "about", "location"])
      .lean();
    const mappedRequests = findRequest.map((r) => {
      const other =
        r.senderId._id.toString() === userId.toString() ? r.receiverId : r.senderId;
      return other;
    });
    return res.status(200).json({
      success: true,
      message:
        mappedRequests.length === 0
          ? "No accepted connections found"
          : "Connection requests fetched successfully",
      data: mappedRequests,
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
        { senderId: userId }
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

    // Find all connections involving the current user
    const connections = await connectionRequestModel.find(
      {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
      "senderId receiverId"
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

    // Apply basic preference filters if available
    if (viewerProfile && viewerProfile.preferences) {
      const { gender, minAge, maxAge } = viewerProfile.preferences;

      if (gender && gender !== "everyone") {
        query.gender = gender;
      }

      if (minAge || maxAge) {
        query.age = {};
        if (minAge) query.age.$gte = minAge;
        if (maxAge) query.age.$lte = maxAge;
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
      "senderId receiverId"
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
          $centerSphere: [viewerProfile.geoLocation.coordinates, radiusInRadians],
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

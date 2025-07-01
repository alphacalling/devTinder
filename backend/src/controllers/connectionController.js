require("dotenv").config();
const userSchema = require("../models/userModel");
const connectionRequestModel = require("../models/connectionModel");

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

// finding all requests with status interested
const getAllConnectionRequests = async (req, res) => {
  const { userId } = req.user;
  const findRequests = await connectionRequestModel
    .find({ status: "interested" }, { senderId: userId })
    .sort({ createdAt: -1 })
    .populate("receiverId", ["userName", "photoUrl", "gender"]);
  //  .populate("receiverId", "userName photoUrl gender");
  const populatedRequests = findRequests.map((request) => request.receiverId);

  if (findRequests.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Request not found in Database",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Connection requests fetched successfully",
    data: populatedRequests,
  });
};

// finding all requests with status accepted
const getAllAcceptedRequests = async (req, res) => {
  try {
    const { userId } = req.user;
    const findRequest = await connectionRequestModel
      .find(
        {
          $or: [
            { senderId: userId, status: "accepted" },
            { receiverId: userId, status: "accepted" },
          ],
        },
        { status: "accepted" },
        { senderId: userId }
      )
      .sort({ createdAt: -1 })
      .populate("receiverId", ["userName", "photoUrl", "gender"]);
    const mappedRequests = findRequest.map((request) => request.receiverId);
    if (findRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found in Database",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Connection requests fetched successfully",
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
      message: "data fetched successfully",
      data: findConnection,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

//getFeedAPI
const getConnectionFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const skip = (page - 1) * limit;

    // Get all user IDs involved in a connection
    const connections = await connectionRequestModel.find(
      {},
      "senderId receiverId"
    );
    const connectedUserIds = new Set();

    connections.forEach((conn) => {
      if (conn.senderId) connectedUserIds.add(conn.senderId.toString());
      if (conn.receiverId) connectedUserIds.add(conn.receiverId.toString());
    });

    // Find users NOT in the above set
    const unconnectedUsers = await userSchema
      .find({ _id: { $nin: Array.from(connectedUserIds) } })
      .sort({ createdAt: -1 })
      .select("userName gender photoUrl age skills about")
      .skip(skip)
      .limit(limit);

    // if (unconnectedUsers.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No new users found",
    //   });
    // }

    return res.status(200).json({
      success: true,
      message: "new users fetched successfully",
      data: unconnectedUsers,
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
  getAllAcceptedRequests,
  getRejectedConnection,
  getConnectionFeed,
};

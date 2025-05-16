const mongoose = require("mongoose");

const connectionRequestModel = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["ignored", "interested", "accepted", "rejected"],
      message: `{VALUE} is incorrect status`,
    },
  },
  { timestamps: true }
);
connectionRequestModel.index({ senderId: 1, receiverId: 1 });

module.exports = mongoose.model(
  "ConnectionRequest",
  connectionRequestModel
);

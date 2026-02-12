const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    tagline: {
      type: String,
      trim: true,
      maxLength: 80,
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 600,
    },
    interests: [
      {
        type: String,
        trim: true,
        maxLength: 40,
      },
    ],
    relationshipGoal: {
      type: String,
      enum: [
        "long_term",
        "short_term",
        "new_friends",
        "not_sure_yet",
        "casual",
      ],
      default: "not_sure_yet",
    },
    jobTitle: {
      type: String,
      trim: true,
      maxLength: 80,
    },
    company: {
      type: String,
      trim: true,
      maxLength: 80,
    },
    education: {
      type: String,
      trim: true,
      maxLength: 120,
    },
    hometown: {
      type: String,
      trim: true,
      maxLength: 120,
    },
    preferences: {
      gender: {
        type: String,
        enum: ["male", "female", "other", "everyone"],
        default: "everyone",
      },
      minAge: {
        type: Number,
        min: 18,
        max: 100,
        default: 18,
      },
      maxAge: {
        type: Number,
        min: 18,
        max: 100,
        default: 60,
      },
    },
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

profileSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("Profile", profileSchema);


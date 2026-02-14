const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      maxLength: 20,
      trim: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      maxLength: 14,
    },
    location: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: [String],
      default: ["https://cdn-icons-png.flaticon.com/512/3135/3135715.png"],
    },
    about: {
      type: String,
      trim: true,
      maxLength: 300,
    },
    skills: {
      type: [String],
      set: function (skills) {
        if (Array.isArray(skills)) {
          return skills.map((s) => s.toLowerCase());
        }
        return skills;
      },
    },
  },
  { timestamps: true },
);

// Pre-save middleware to normalize gender
userSchema.pre("save", function (next) {
  if (this.gender) {
    this.gender = this.gender.toLowerCase();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

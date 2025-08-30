const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
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
    trim: true,
    default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  about: {
    type: String,
    trim: true,
    maxLength: 300,
  },
  skills: [
    {
      type: [String],
      enum: [
        "java",
        "python",
        "c++",
        "javascript",
        "reactjs",
        "nodejs",
        "mongoDB",
        "sql",
      ],
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

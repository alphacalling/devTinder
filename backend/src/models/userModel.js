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
    // required: true,
    maxLength: 20,
  },
  age: {
    type: Number,
  },
  phone: {
    type: String,
    trim: true,
    maxLength: 14,
  },
  photoUrl: {
    type: String,
    trim: true,
    default: "https://images.app.goo.gl/fYYrRKxXS53UeB396",
  },
  skills: {
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
});

module.exports = mongoose.model("User", userSchema);

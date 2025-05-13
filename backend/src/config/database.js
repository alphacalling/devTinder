require("dotenv").config();
let mongoose = require("mongoose");


let connectDB;

try {
  connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("database connected successfully");
  };
} catch (err) {
  console.log("Error: ", err);
}

module.exports = connectDB;

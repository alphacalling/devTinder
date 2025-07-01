require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = require("../models/userModel");
const { validator } = require("../utils/validator");

//register user
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      userName,
      age,
      phone,
      photoUrl,
      skills,
      gender,
      about,
    } = req.body;

    // email validation
    let validationError = validator(req);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }
    const findUser = await userSchema.findOne({ email });
    console.log(findUser);
    if (findUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists, Please logIn",
      });
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userSchema({
      email: email,
      password: hashedPassword,
      userName: userName,
      age: age,
      phone: phone,
      photoUrl: photoUrl,
      skills: skills,
      gender: gender,
      about: about,
    });

    await newUser.save();
    newUser.password = undefined;
    let myuser = newUser;
    return res.status(200).json({
      success: true,
      message: "user successfully registered successfully",
      data: myuser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

//login user
const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }
    const findUser = await userSchema.findOne({ email });
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }
    const token = jwt.sign(
      {
        userId: findUser._id,
        email: findUser.email,
        userName: findUser.userName,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: 60 * 60 * 15,
      }
    );
    res.cookie("token", token);
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    // });

    return res.status(200).json({
      success: true,
      message: "User logged In successfully",
      // data: token,
      user: {
        userName: findUser.userName,
        photoUrl: findUser.photoUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

//change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const id = req.user.userId;
    console.log("User ID: ", id);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }
    const findUser = await userSchema.findOne({ _id: id });
    // console.log(findUser);

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      findUser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Old password is not correct",
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide different password",
      });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    findUser.password = newPasswordHash;

    await findUser.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

//refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({
        success: false,
        message: "No refresh token found",
      });

    const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    const accessToken = jwt.sign(
      { userId: decode.userId, email: decode.email },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const refreshTokenExpiration = decode.exp;

    // generating new token if ACCESS_SECRET going to expire
    if (refreshTokenExpiration - currentTime < 900) {
      const newRefreshToken = jwt.sign(
        { userId: decode.userId, email: decode.email },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      });
    }
    res.status(200).json({
      accessToken: accessToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

//logout user
const logOut = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

module.exports = { register, logIn, logOut, refreshToken, changePassword };

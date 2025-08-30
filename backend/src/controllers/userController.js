require("dotenv").config();
const userSchema = require("../models/userModel");

// view dashboard
const profileView = async (req, res) => {
  const { userId } = req.user;
  const userDashboard = await userSchema.findById(userId);
  // console.log(userDashboard);

  if (!userDashboard) {
    return res.status(404).json({
      success: false,
      message: "User not found in Database",
    });
  }
  // console.log(userDashboard);

  userDashboard.password = undefined;
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    userDashboard,
  });
};

// profile update
const profileUpdate = async (req, res) => {
  try {
    const { userId } = req.user;
    let { userName, photoUrl, age, phone, skills, gender, about, location } =
      req.body;

    const findUser = await userSchema.findById(userId);
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }

    const acceptedSkills = [
      "java",
      "python",
      "c++",
      "javascript",
      "reactjs",
      "nodejs",
      "mongodb",
      "sql",
    ];

    if (photoUrl !== undefined) {
      if (typeof photoUrl === "string") {
        findUser.photoUrl = [photoUrl];
      } else if (Array.isArray(photoUrl)) {
        findUser.photoUrl = photoUrl;
      } else {
        return res.status(400).json({
          success: false,
          message: "photoUrl must be a string or an array of strings",
        });
      }
    }

    if (skills !== undefined) {
      if (typeof skills === "string") {
        skills = [skills];
      }
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be a string or an array of strings",
        });
      }
      const normalizedSkills = skills.map((s) => s.toLowerCase());

      // check invalid skills
      const invalidSkills = normalizedSkills.filter(
        (s) => !acceptedSkills.includes(s)
      );
      if (invalidSkills.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid skills: ${invalidSkills.join(", ")}`,
        });
      }

      findUser.skills = normalizedSkills;
    }

    // Update other fields if provided
    if (userName !== undefined) findUser.userName = userName;
    if (age !== undefined) findUser.age = age;
    if (phone !== undefined) findUser.phone = phone;
    if (gender !== undefined) findUser.gender = gender;
    if (about !== undefined) findUser.about = about;
    if (location !== undefined) findUser.location = location;

    // Save
    await findUser.save();
    findUser.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: findUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  profileView,
  profileUpdate,
};

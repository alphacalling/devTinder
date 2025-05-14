require("dotenv").config();
const userSchema = require("../models/userModel");
// view dashboard
const profileView = async (req, res) => {
  const { userId } = req.user;
  const userDashboard = await userSchema.findById(userId);
  if (!userDashboard) {
    return res.status(404).json({
      success: false,
      message: "User not found in Database",
    });
  }
  userDashboard.password = undefined;
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: userDashboard,
  });
};

// profile update
const profileUpdate = async (req, res) => {
  const { userId } = req.user;
  let { userName, photoUrl, age, phone, skills, gender, about } = req.body;
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
    "sql",
  ];

  // checking and validating skills for storing in array format
  let normalizedSkills = findUser.skills;

  if (typeof skills === "string") {
    skills = [skills];
  } else if (!Array.isArray(skills)) {
    return res.status(400).json({
      success: false,
      message: "Skills must be a string or an array of strings",
    });
  }
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }
    normalizedSkills = skills.map((skill) => skill.toLowerCase());
    console.log(normalizedSkills);
  }

  // invalid skills check
  const invalidSkills = normalizedSkills.filter(
    (skill) => !acceptedSkills.includes(skill)
  );
  if (invalidSkills.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid skills: ${invalidSkills.join(", ")}`,
    });
  }
  // updating values
  if (userName) findUser.userName = userName;
  if (photoUrl) findUser.photoUrl = photoUrl;
  if (age) findUser.age = age;
  if (phone) findUser.phone = phone;
  if (normalizedSkills) findUser.skills = normalizedSkills;
  if (gender) findUser.gender = gender;
  if (about) findUser.about = about;

  // save details in database
  await findUser.save();
  findUser.password = undefined;

  return res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: findUser,
  });
};

module.exports = {
  profileView,
  profileUpdate,
};

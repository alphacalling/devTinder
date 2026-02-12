require("dotenv").config();
const userSchema = require("../models/userModel");
const Profile = require("../models/profileModel");

// view dashboard (user + dating profile)
const profileView = async (req, res) => {
  const { userId } = req.user;

  const userDashboard = await userSchema.findById(userId);

  if (!userDashboard) {
    return res.status(404).json({
      success: false,
      message: "User not found in Database",
    });
  }

  const profile = await Profile.findOne({ user: userId });

  userDashboard.password = undefined;

  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    user: userDashboard,
    profile,
  });
};

// profile update
const profileUpdate = async (req, res) => {
  try {
    const { userId } = req.user;
    let {
      userName,
      photoUrl,
      age,
      phone,
      skills,
      gender,
      about,
      location,
      // profile-specific fields
      tagline,
      bio,
      interests,
      relationshipGoal,
      jobTitle,
      company,
      education,
      hometown,
      preferences,
      latitude,
      longitude,
    } = req.body;

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

    // Upsert profile document
    const existingProfile = await Profile.findOne({ user: userId });

    let profileData = existingProfile || new Profile({ user: userId });

    if (tagline !== undefined) profileData.tagline = tagline;
    if (bio !== undefined) profileData.bio = bio;

    if (interests !== undefined) {
      if (typeof interests === "string") {
        interests = [interests];
      }
      if (!Array.isArray(interests)) {
        return res.status(400).json({
          success: false,
          message: "Interests must be a string or an array of strings",
        });
      }
      profileData.interests = interests;
    }

    if (relationshipGoal !== undefined)
      profileData.relationshipGoal = relationshipGoal;
    if (jobTitle !== undefined) profileData.jobTitle = jobTitle;
    if (company !== undefined) profileData.company = company;
    if (education !== undefined) profileData.education = education;
    if (hometown !== undefined) profileData.hometown = hometown;

    if (preferences !== undefined) {
      profileData.preferences = {
        ...profileData.preferences?.toObject?.(),
        ...preferences,
      };
    }

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      !Number.isNaN(Number(latitude)) &&
      !Number.isNaN(Number(longitude))
    ) {
      profileData.geoLocation = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    // Save user & profile
    await findUser.save();
    const savedProfile = await profileData.save();
    findUser.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: findUser,
      profile: savedProfile,
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

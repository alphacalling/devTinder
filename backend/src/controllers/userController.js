require("dotenv").config();
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const {
  normalizeSkills,
  normalizeGender,
  normalizeInterests,
} = require("../utils/helperfunction");

// View dashboard (user + dating profile)
const profileView = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }

    const profile = await Profile.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Profile update
const profileUpdate = async (req, res) => {
  try {
    const { userId } = req.user;

    const {
      userName,
      photoUrl,
      age,
      phone,
      skills,
      gender,
      about,
      location,
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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in Database",
      });
    }

    // Handle photoUrl
    if (photoUrl !== undefined) {
      if (typeof photoUrl === "string") {
        user.photoUrl = [photoUrl];
      } else if (Array.isArray(photoUrl)) {
        user.photoUrl = photoUrl;
      } else {
        return res.status(400).json({
          success: false,
          message: "photoUrl must be a string or an array of strings",
        });
      }
    }

    // Handle skills
    if (skills !== undefined) {
      const skillsResult = normalizeSkills(skills);

      if (skillsResult.error) {
        return res.status(400).json({
          success: false,
          message: skillsResult.error,
        });
      }

      user.skills = skillsResult.data;
    }

    // Handle gender
    if (gender !== undefined) {
      const genderResult = normalizeGender(gender);

      if (genderResult.error) {
        return res.status(400).json({
          success: false,
          message: genderResult.error,
        });
      }

      user.gender = genderResult.data;
    }

    // Update other user fields
    if (userName !== undefined) user.userName = userName;
    if (age !== undefined) user.age = age;
    if (phone !== undefined) user.phone = phone;
    if (about !== undefined) user.about = about;
    if (location !== undefined) user.location = location;

    // Handle Profile document
    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({ user: userId });
    }

    // Update profile fields
    if (tagline !== undefined) profile.tagline = tagline;
    if (bio !== undefined) profile.bio = bio;

    // Handle interests
    if (interests !== undefined) {
      const interestsResult = normalizeInterests(interests);

      if (interestsResult.error) {
        return res.status(400).json({
          success: false,
          message: interestsResult.error,
        });
      }

      profile.interests = interestsResult.data;
    }

    if (relationshipGoal !== undefined)
      profile.relationshipGoal = relationshipGoal;
    if (jobTitle !== undefined) profile.jobTitle = jobTitle;
    if (company !== undefined) profile.company = company;
    if (education !== undefined) profile.education = education;
    if (hometown !== undefined) profile.hometown = hometown;

    // Handle preferences
    if (preferences !== undefined) {
      profile.preferences = {
        ...(profile.preferences?.toObject?.() || profile.preferences || {}),
        ...preferences,
      };
    }

    // Handle geoLocation
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      !Number.isNaN(Number(latitude)) &&
      !Number.isNaN(Number(longitude))
    ) {
      profile.geoLocation = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    // Save both documents
    await user.save();
    const savedProfile = await profile.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: userResponse,
      profile: savedProfile,
    });
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { profileView, profileUpdate };

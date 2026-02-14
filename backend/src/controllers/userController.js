require("dotenv").config();
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const {
  normalizeSkills,
  normalizeGender,
  normalizeInterests,
} = require("../utils/helperfunction");
const {
  PREFERRED_GENDER_OPTIONS,
  RELATIONSHIP_GOALS,
} = require("../utils/constants");

// View dashboard
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
        const validUrls = photoUrl.filter(
          (url) => typeof url === "string" && url.trim() !== "",
        );
        if (validUrls.length === 0) {
          return res.status(400).json({
            success: false,
            message: "At least one valid photo URL is required",
          });
        }
        user.photoUrl = validUrls;
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
    if (age !== undefined) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        return res.status(400).json({
          success: false,
          message: "Age must be a number between 18 and 120",
        });
      }
      user.age = ageNum;
    }
    if (phone !== undefined) user.phone = phone;
    if (about !== undefined) user.about = about;
    if (location !== undefined) user.location = location;

    // Handle Profile document
    let profile_doc = await Profile.findOne({ user: userId });

    if (!profile_doc) {
      profile_doc = new Profile({ user: userId });
    }

    // Update profile fields
    if (tagline !== undefined) profile_doc.tagline = tagline;
    if (bio !== undefined) profile_doc.bio = bio;

    // Handle interests
    if (interests !== undefined) {
      const interestsResult = normalizeInterests(interests);
      if (interestsResult.error) {
        return res.status(400).json({
          success: false,
          message: interestsResult.error,
        });
      }
      profile_doc.interests = interestsResult.data;
    }

    // Handle relationship goal
    if (relationshipGoal !== undefined) {
      const normalizedGoal = relationshipGoal.trim().toLowerCase();
      if (!RELATIONSHIP_GOALS.includes(normalizedGoal)) {
        return res.status(400).json({
          success: false,
          message: `Invalid relationship goal: "${relationshipGoal}". Allowed: ${RELATIONSHIP_GOALS.join(", ")}`,
        });
      }
      profile_doc.relationshipGoal = normalizedGoal;
    }

    if (jobTitle !== undefined) profile_doc.jobTitle = jobTitle;
    if (company !== undefined) profile_doc.company = company;
    if (education !== undefined) profile_doc.education = education;
    if (hometown !== undefined) profile_doc.hometown = hometown;

    // Handle preferences with validation
    if (preferences !== undefined) {
      const existingPrefs =
        profile_doc.preferences?.toObject?.() || profile_doc.preferences || {};

      const newPrefs = { ...existingPrefs };

      if (preferences.gender !== undefined) {
        const normalizedPrefGender = preferences.gender.trim().toLowerCase();
        if (!PREFERRED_GENDER_OPTIONS.includes(normalizedPrefGender)) {
          return res.status(400).json({
            success: false,
            message: `Invalid preferred gender: "${preferences.gender}". Allowed: ${PREFERRED_GENDER_OPTIONS.join(", ")}`,
          });
        }
        newPrefs.gender = normalizedPrefGender;
      }

      if (preferences.minAge !== undefined) {
        const minAge = Number(preferences.minAge);
        if (isNaN(minAge) || minAge < 18) {
          return res.status(400).json({
            success: false,
            message: "Minimum age must be at least 18",
          });
        }
        newPrefs.minAge = minAge;
      }

      if (preferences.maxAge !== undefined) {
        const maxAge = Number(preferences.maxAge);
        if (isNaN(maxAge) || maxAge > 120) {
          return res.status(400).json({
            success: false,
            message: "Maximum age cannot exceed 120",
          });
        }
        newPrefs.maxAge = maxAge;
      }

      if (
        newPrefs.minAge &&
        newPrefs.maxAge &&
        newPrefs.minAge > newPrefs.maxAge
      ) {
        return res.status(400).json({
          success: false,
          message: "Minimum age cannot be greater than maximum age",
        });
      }

      profile_doc.preferences = newPrefs;
    }

    // Handle geoLocation
    if (latitude !== undefined && longitude !== undefined) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude must be valid numbers",
        });
      }

      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }

      if (lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }

      profile_doc.geoLocation = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    // Save both documents
    await user.save();
    const savedProfile = await profile_doc.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: userResponse,
      profile: savedProfile,
    });
  } catch (err) {
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

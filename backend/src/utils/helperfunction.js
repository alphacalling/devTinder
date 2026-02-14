const {
  GENDER_OPTIONS,
  SKILLS_OPTIONS,
  INTERESTS_OPTIONS,
} = require("./constants");

const normalizeSkills = (skills) => {
  let skillsArray;

  if (typeof skills === "string") {
    skillsArray = skills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  } else if (Array.isArray(skills)) {
    skillsArray = skills
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter(Boolean);
  } else {
    return { error: "Skills must be a string or an array of strings" };
  }

  const invalid = skillsArray.filter((s) => !SKILLS_OPTIONS.includes(s));
  if (invalid.length > 0) {
    return {
      error: `Invalid skills: ${invalid.join(", ")}. Allowed: ${SKILLS_OPTIONS.join(", ")}`,
    };
  }

  return { data: skillsArray };
};

const normalizeGender = (gender) => {
  if (typeof gender !== "string") {
    return { error: "Gender must be a string" };
  }

  const normalized = gender.trim().toLowerCase();

  if (!GENDER_OPTIONS.includes(normalized)) {
    return {
      error: `Invalid gender: "${gender}". Allowed: ${GENDER_OPTIONS.join(", ")}`,
    };
  }

  return { data: normalized };
};

const normalizeInterests = (interests) => {
  let interestsArray;

  if (typeof interests === "string") {
    interestsArray = interests
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  } else if (Array.isArray(interests)) {
    interestsArray = interests
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter(Boolean);
  } else {
    return { error: "Interests must be a string or an array of strings" };
  }

  const invalid = interestsArray.filter((i) => !INTERESTS_OPTIONS.includes(i));
  if (invalid.length > 0) {
    return {
      error: `Invalid interests: ${invalid.join(", ")}. Allowed: ${INTERESTS_OPTIONS.join(", ")}`,
    };
  }

  return { data: interestsArray };
};

module.exports = {
  normalizeSkills,
  normalizeGender,
  normalizeInterests,
};

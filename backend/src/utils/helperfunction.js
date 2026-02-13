// Constants
const ACCEPTED_SKILLS = [
  "java",
  "python",
  "c++",
  "javascript",
  "reactjs",
  "nodejs",
  "mongodb",
  "sql",
];

const ACCEPTED_GENDERS = ["male", "female", "other"];

//* Helper function to normalize skills
export const normalizeSkills = (skills) => {
  if (!skills) return null;

  // Convert single string to array
  if (typeof skills === "string") {
    skills = [skills];
  }

  if (!Array.isArray(skills)) {
    return { error: "Skills must be a string or an array of strings" };
  }

  // Normalize to lowercase
  const normalizedSkills = skills.map((s) => s.trim().toLowerCase());

  // Check for invalid skills
  const invalidSkills = normalizedSkills.filter(
    (s) => !ACCEPTED_SKILLS.includes(s),
  );

  if (invalidSkills.length > 0) {
    return { error: `Invalid skills: ${invalidSkills.join(", ")}` };
  }

  return { data: normalizedSkills };
};

//* Helper function to normalize gender
export const normalizeGender = (gender) => {
  if (!gender) return null;

  const normalizedGender = gender.trim().toLowerCase();

  if (!ACCEPTED_GENDERS.includes(normalizedGender)) {
    return {
      error: `Invalid gender. Must be one of: ${ACCEPTED_GENDERS.join(", ")}`,
    };
  }

  return { data: normalizedGender };
};

//* Helper function to normalize interests
export const normalizeInterests = (interests) => {
  if (!interests) return null;

  if (typeof interests === "string") {
    interests = [interests];
  }

  if (!Array.isArray(interests)) {
    return { error: "Interests must be a string or an array of strings" };
  }

  return { data: interests.map((i) => i.trim()) };
};

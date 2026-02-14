const express = require("express");
const router = express.Router();
const {
  GENDER_OPTIONS,
  PREFERRED_GENDER_OPTIONS,
  RELATIONSHIP_GOALS,
  SKILLS_OPTIONS,
  INTERESTS_OPTIONS,
} = require("../utils/constants");

router.get("/form-options", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      genderOptions: GENDER_OPTIONS,
      preferredGenderOptions: PREFERRED_GENDER_OPTIONS,
      relationshipGoals: RELATIONSHIP_GOALS,
      skillsOptions: SKILLS_OPTIONS,
      interestsOptions: INTERESTS_OPTIONS,
    },
  });
});

module.exports = router;

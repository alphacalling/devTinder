const express = require("express");
const { profileView, profileUpdate } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile-view", authMiddleware, profileView);
router.patch("/profile-update", authMiddleware, profileUpdate);
module.exports = router;

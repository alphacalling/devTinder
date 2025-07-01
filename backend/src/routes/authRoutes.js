const express = require("express");
const {
  register,
  logIn,
  logOut,
  refreshToken,
  changePassword,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/register", register);
router.post("/login", logIn);
router.patch("/change-password",authMiddleware, changePassword);
router.get("/logout", logOut);
router.get("/refresh-token", refreshToken);

module.exports = router;

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
router.post("/auth/register", register);
router.post("/auth/login", logIn);
router.patch("/auth/change-password",authMiddleware, changePassword);
router.get("/auth/logout", logOut);
router.get("/auth/refresh-token", refreshToken);

module.exports = router;

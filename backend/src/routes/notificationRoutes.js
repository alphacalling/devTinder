const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getNotifications,
  markRead,
  markAllRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllRead);
router.patch("/:id/read", authMiddleware, markRead);

module.exports = router;

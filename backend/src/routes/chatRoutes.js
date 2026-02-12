const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getConversations, getMessages } = require("../controllers/chatController");

const router = express.Router();

router.get("/conversations", authMiddleware, getConversations);
router.get("/messages/:otherUserId", authMiddleware, getMessages);

module.exports = router;

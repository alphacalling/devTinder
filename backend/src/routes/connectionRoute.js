const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  connectionRequest,
  connectionReview,
  getAllConnectionRequests,
  getAllAcceptedRequests,
  getConnectionFeed,
  getRejectedConnection,
} = require("../controllers/connectionController");

const router = express.Router();

router.post(
  "/connection-request/send/:requestStatus/:receiverId",
  authMiddleware,
  connectionRequest
);
router.post(
  "/connection-request/review/:requestStatus/:senderId",
  authMiddleware,
  connectionReview
);
router.get(
  "/connection-requests/requests",
  authMiddleware,
  getAllConnectionRequests
);
router.get(
  "/connection-requests/accepted-requests",
  authMiddleware,
  getAllAcceptedRequests
);
router.get(
  "/connection-requests/rejected-requests",
  authMiddleware,
  getRejectedConnection
);
router.get(
  "/connection-requests/connection-feed",
  authMiddleware,
  getConnectionFeed
);

module.exports = router;

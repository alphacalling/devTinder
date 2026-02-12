const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  connectionRequest,
  connectionReview,
  getAllConnectionRequests,
  getPendingReceived,
  getPendingSent,
  getAllAcceptedRequests,
  getConnectionFeed,
  getRejectedConnection,
  getNearbyConnections,
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
  "/connection-requests/pending-received",
  authMiddleware,
  getPendingReceived
);
router.get(
  "/connection-requests/pending-sent",
  authMiddleware,
  getPendingSent
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
router.get("/nearby", authMiddleware, getNearbyConnections);

module.exports = router;

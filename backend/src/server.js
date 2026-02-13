const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Database connection
const connectDB = require("./config/database");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");
const connectionRoute = require("./routes/connectionRoute");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Models for socket
const Message = require("./models/messageModel");
const connectionRequestModel = require("./models/connectionModel");
const Notification = require("./models/notificationModel");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: true, credentials: true },
  path: "/socket.io",
});

app.set("io", io);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/posts", postRoute);
app.use("/api/connections", connectionRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 - Route Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Socket.io: authenticate by cookie (token)
function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]+)/);
  return match ? match[1].trim() : null;
}
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.query?.token ||
    getTokenFromCookie(socket.handshake.headers?.cookie);
  if (!token) {
    return next(new Error("No token"));
  }
  try {
    const decode = jwt.verify(token, process.env.ACCESS_SECRET);
    socket.userId = decode.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  socket.join(`user:${userId}`);
  console.log("Socket connected:", userId);

  socket.on("send_message", async (payload, callback) => {
    const { toUserId, text } = payload || {};
    if (!toUserId || !text || typeof text !== "string" || !text.trim()) {
      return callback?.({ success: false, message: "Invalid payload" });
    }
    try {
      const connection = await connectionRequestModel.findOne({
        $or: [
          { senderId: userId, receiverId: toUserId, status: "accepted" },
          { senderId: toUserId, receiverId: userId, status: "accepted" },
        ],
      });
      if (!connection) {
        return callback?.({ success: false, message: "Not an accepted connection" });
      }
      const msg = new Message({
        senderId: userId,
        receiverId: toUserId,
        text: text.trim().slice(0, 2000),
      });
      await msg.save();
      const out = {
        _id: msg._id,
        senderId: String(msg.senderId),
        receiverId: String(msg.receiverId),
        text: msg.text,
        read: msg.read,
        createdAt: msg.createdAt,
      };
      io.to(`user:${toUserId}`).emit("new_message", out);
      const notif = new Notification({
        userId: toUserId,
        type: "chat",
        fromUserId: userId,
        message: msg.text.slice(0, 80),
        meta: { messageId: msg._id },
      });
      await notif.save();
      io.to(`user:${toUserId}`).emit("notification", {
        _id: notif._id,
        type: "chat",
        fromUserId: String(userId),
        message: notif.message,
        createdAt: notif.createdAt,
      });
      callback?.({ success: true, data: out });
    } catch (err) {
      console.error("send_message error:", err);
      callback?.({ success: false, message: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", userId);
  });
});

const PORT = process.env.PORT || 8080;

// Start server only after DB connects
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });

module.exports = { app, server, io };
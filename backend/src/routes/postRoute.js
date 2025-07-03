const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { createPost, updatePost, deletePost } = require("../controllers/postController");

const router = express.Router();

router.post("/create-post", authMiddleware, createPost);
router.patch("/update-post/:id", authMiddleware, updatePost);
router.delete("/delete-post/:id", authMiddleware, deletePost);
module.exports = router;

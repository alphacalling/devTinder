const postSchema = require("../models/postModel");

// create post
const createPost = async (req, res) => {
  try {
    const { userId } = req.user;
    const { post, imageUrl, caption } = req.body;
    console.log(
      "userId: ",
      userId,
      "post:",
      post,
      "imageUrl:",
      imageUrl,
      "caption:",
      caption
    );

    if (!post || !caption) {
      return res.status(400).json({
        success: false,
        message: "please provide the post",
      });
    }

    const newPost = new postSchema({
      userId,
      post,
      imageUrl,
      caption,
    });

    await newPost.save();

    return res.status(200).json({
      success: true,
      message: "Post Created Successfully",
      data: newPost,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// update post
const updatePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { post, caption, imageUrl } = req.body;
    console.log(
      "id:",
      id,
      "userId:",
      userId,
      "post:",
      post,
      "caption:",
      caption,
      "imageUrl:",
      imageUrl
    );

    if (!post || !caption) {
      return res.status(400).json({
        success: false,
        message: "Please proivde post",
      });
    }
    const findPost = await postSchema.findById(id);

    if (!findPost) {
      return res.status(404).json({
        success: false,
        message: "No post found",
      });
    }
    if (findPost.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can not update this post",
      });
    }
    if (post !== undefined) findPost.post = post;
    if (caption !== undefined) findPost.caption = caption;
    if (imageUrl !== undefined) findPost.imageUrl = imageUrl;

    // findPost.populate("userId", ["userName", "photoUrl", "gender"]);
    await findPost.save();
    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: findPost,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// delete post
const deletePost = async(req, res)=>{
  const {id} = req.params;
  const {userId} = req.user;
  const findPost = await postSchema.findById(id);
  if(!findPost){
    return res.status(404).json({
      success: false,
      message: "No post found",
    });
  }
  if(findPost.userId._id.toString() !== userId){
    return res.status(403).json({
      success: false,
      message: "You can not delete this post",
    });
  }
  await findPost.deleteOne();
  return res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
}

module.exports = { createPost, updatePost, deletePost };

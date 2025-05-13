const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token found",
    });
  }
  try {
    const decode = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong : ` + err.message,
    });
  }
};

module.exports = authMiddleware;

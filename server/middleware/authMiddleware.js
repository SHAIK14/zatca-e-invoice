// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;

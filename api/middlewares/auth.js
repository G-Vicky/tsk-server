require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async function verifyToken(req, res, next) {
  const header = req.header("Authorization") || "";
  const token = header.split(" ")[1];
  if (!token || token === "")
    return res.status(401).json({
      status: "failure",
      error_code: "un-authorized",
      error: ["User not Authorized"],
    });

  try {
    const decoded = await jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "failure",
        error_code: "not-found",
        error: ["User not found/User doesn't exist"],
      });
    }
  } catch (error) {
    console.log("error: " + error);
    return res.status(401).json({
      status: "failure",
      error_code: "invalid-auth-token",
      error: ["auth-token is invalid"],
    });
  }

  next();
};

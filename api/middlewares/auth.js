require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({
      status: "failure",
      message: "User not Authorized",
    });

  try {
    const decoded = await jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "failure",
        error_code: "not-found",
        error_message: "User not found/User doesn't exist",
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

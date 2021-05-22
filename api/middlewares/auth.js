require("dotenv").config();
const jwt = require("jsonwebtoken");

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
  } catch (error) {
    console.log("error: " + error);
    return res.status(401).json({
      status: "failure",
      message: "Invalid auth-token",
    });
  }

  next();
};

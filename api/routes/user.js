const router = require("express").Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
require("dotenv").config();

const { userValidation, newUserValidation } = require("../validation/user");
const User = require("../models/user");
const auth = require("../middlewares/auth");

//get info about current user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).catch((err) => {
    return res.status(500).json({
      status: "failure",
      error_code: "server-error",
      error_message: "Internal Server Error",
    });
  });

  if (!user)
    return res.status(404).json({
      status: "failure",
      error_code: "not-found",
      error_message: "User not found/User doesn't exist",
    });

  const data = _.pick(user, ["_id", "username", "email_address"]);

  return res.status(200).json({
    status: "Success",
    message: "User retrieved successfully",
    data: data,
  });
});

//creating new user
router.post("/register", async (req, res) => {
  const { error } = newUserValidation(req.body);
  if (error) {
    let result = _.map(error.details, "message");
    result = _.map(result, (s) => s.replace(/['"]+/g, ""));
    return res.status(400).json({
      status: "failure",
      error_code: "joi-fails",
      error_message: result,
    });
  }

  const { username, email_address, password } = req.body;
  const user = await User.find({ email_address: email_address });
  if (user.length) {
    return res.status(400).json({
      status: "failure",
      error_code: "duplicate-entry",
      error_message: ["user already exists"],
    });
  }

  const newUser = new User({
    username: username,
    email_address: email_address,
  });
  newUser.password = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS)
  );

  const err = await newUser.validateSync();
  if (err) {
    return res.status(400).json({
      status: "failure",
      error_code: "schema-fails",
      error_message: [err.message],
    });
  }

  await newUser.save();
  const token = newUser.generateAuthToken();
  res.setHeader("x-auth-token", token);
  const data = _.pick(newUser, ["_id", "username", "email_address"]);
  return res.status(201).json({
    status: "success",
    message: "new user created",
    data: data,
  });
});

//login
router.post("/login", async (req, res) => {
  const { error } = userValidation(req.body);
  if (error) {
    let result = _.map(error.details, "message");
    result = _.map(result, (s) => s.replace(/['"]+/g, ""));
    return res.status(400).json({
      status: "failure",
      error_code: "joi-fails",
      error: result,
    });
  }

  const { email_address, password } = req.body;
  const user = await User.find({ email_address: email_address });
  if (!user.length) {
    console.log(user);
    return res.status(404).json({
      status: "failure",
      error_code: "not-found",
      error: ["User not found"],
    });
  }

  const verifiedPassword = await bcrypt.compare(password, user[0].password);
  if (!verifiedPassword)
    return res.status(400).json({
      status: "failure",
      error_code: "invalid",
      error: ["Incorrect password"],
    });

  const token = user[0].generateAuthToken();
  res.setHeader("x-auth-token", token);
  const data = _.pick(user[0], ["_id", "username", "email_address"]);
  return res.status(200).json({
    status: "success",
    message: "user logged in",
    data: data,
  });
});

module.exports = router;

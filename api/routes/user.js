const router = require("express").Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
require("dotenv").config();

const { userValidation, newUserValidation } = require("../validation/user");
const User = require("../models/user");
const auth = require("../middlewares/auth");

router.get("/me", auth, async (req, res) => {
  const result = await User.findById(req.user._id);

  if (!result)
    return res.status(404).json({
      status: "failure",
      message: "User not found",
    });

  const data = _.pick(result, ["_id", "username", "email_address"]);

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
    const result = _.map(error.details, "message");

    return res.status(400).json({
      status: "failure",
      message: "JOI user validation fails!",
      error_message: result,
    });
  }

  const { username, email_address, password } = req.body;

  const userExists = await User.find({ email_address: email_address });

  if (userExists.length) {
    console.log(userExists);
    return res.status(400).json({
      status: "failure",
      message: "user already exists",
      error: "duplicate key entry",
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

  const result = await newUser.save().catch((err) => {
    console.log("unable to create new user: " + err);

    return res.status(400).json({
      status: "failure",
      message: "unable to create new user",
      error: err.message,
    });
  });

  const token = newUser.generateAuthToken();

  res.setHeader("x-auth-token", token);

  const data = _.pick(result, ["_id", "username", "email_address"]);

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
    const result = _.map(error.details, "message");

    return res.status(400).json({
      status: "failure",
      message: "JOI user validation fails!",
      error_message: result,
    });
  }

  const { email_address, password } = req.body;

  const userExists = await User.find({ email_address: email_address });

  if (!userExists.length) {
    console.log(userExists);
    return res.status(400).json({
      status: "failure",
      message: "User not found",
    });
  }

  const verifiedPassword = await bcrypt.compare(
    password,
    userExists[0].password
  );
  if (!verifiedPassword)
    return res.status(400).json({
      status: "failure",
      message: "Incorrect password",
    });

  console.log("USER", userExists[0].generateAuthToken());

  const token = userExists[0].generateAuthToken();

  res.setHeader("x-auth-token", token);

  const data = _.pick(userExists[0], ["_id", "username", "email_address"]);

  return res.status(200).json({
    status: "success",
    message: "user logged in",
    data: data,
  });
});

module.exports = router;

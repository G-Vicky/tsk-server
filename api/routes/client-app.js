const router = require("express").Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const randomstring = require("randomstring");
const auth = require("../middlewares/auth");
const User = require("../models/user");
const { clientAppValidation } = require("../validation/client-app");

//get API-APP
router.get("/myapp", auth, (req, res) => {
  res.send("My API APP");
});

// create new API-APP
router.post("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.app.name) {
    const data = _.pick(user, ["username", "email_address", "app"]);
    return res.status(400).json({
      status: "failure",
      error_code: "duplicate-key",
      error: ["app already exists"],
      data: data,
    });
  }

  const { error } = clientAppValidation(req.body);
  if (error) {
    let result = _.map(error.details, "message");
    result = _.map(result, (s) => s.replace(/['"]+/g, ""));
    return res.status(400).json({
      status: "failure",
      error_code: "joi-fails",
      error: result,
    });
  }

  const appName = req.body.app_name;
  const client_id = new mongoose.Types.ObjectId();
  const client_secret = randomstring.generate();
  user.app.name = appName;
  user.app.client_id = client_id;
  user.app.client_secret = client_secret;

  const err = await user.validateSync();
  if (err) {
    return res.status(400).json({
      status: "failure",
      error_code: "schema-fails",
      message: "Schema validation fails",
      error: [err.message],
    });
  }

  await user.save();
  const data = _.pick(user, ["username", "email_address", "app"]);

  res.json({
    status: "success",
    message: "new app created successfully!",
    data: data,
  });
});

module.exports = router;

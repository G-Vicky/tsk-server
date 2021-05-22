const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  email_address: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 255,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(v);
      },
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 1024,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.jwtPrivateKey);
  return token;
};

module.exports = mongoose.model("User", userSchema);

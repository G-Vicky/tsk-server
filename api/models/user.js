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
  app: {
    name: {
      type: String,
      minLength: 3,
      maxLength: 255,
      required: function () {
        return this.app.client_id || this.app.client_secret;
      },
    },
    client_id: {
      type: mongoose.Types.ObjectId,
      minLength: 3,
      maxLength: 255,
      required: function () {
        return this.app.name;
      },
    },
    client_secret: {
      type: String,
      minLength: 3,
      maxLength: 1024,
      required: function () {
        return this.app.name;
      },
    },
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.jwtPrivateKey);
  return token;
};

module.exports = mongoose.model("User", userSchema);

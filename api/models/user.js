const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);

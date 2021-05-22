const express = require("express");

const app = express();

app.get("/", (req, res) => {
  return res.json({
    status: "Success",
    message: "Server running",
  });
});

module.exports = app;

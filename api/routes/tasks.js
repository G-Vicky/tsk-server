const router = require("express").Router();
const mongoose = require("mongoose");
const _ = require("lodash");
const verifyToken = require("../middlewares/auth");
const User = require("../models/user");
const {
  taskValidation,
  taskItemValidation,
} = require("../validation/joi-task");
const user = require("../models/user");

//get all tasks
router.get("/", verifyToken, async (req, res) => {
  const data = await User.find(
    { _id: req.user._id },
    { username: 1, email_address: 1, tasks: 1 }
  );
  res.status(200).json({
    status: "success",
    message: "tasks retrieved succesfully",
    data: data,
  });
});

//create new task
router.post("/", verifyToken, async (req, res) => {
  const { error } = taskValidation(req.body);
  if (error) {
    let result = _.map(error.details, "message");
    result = _.map(result, (s) => s.replace(/['"]+/g, ""));
    return res.status(400).json({
      status: "failure",
      error_code: "joi-fails",
      error: result,
    });
  }

  const task = req.body;

  const data = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { tasks: task } },
    { new: true, fields: { username: 1, email_address: 1, tasks: 1 } }
  );

  res.status(201).json({
    status: "success",
    message: "new task added",
    data: data,
  });
});

//delete task
router.delete("/:taskID", verifyToken, async (req, res) => {
  const taskID = req.params.taskID;
  const result = await User.updateOne(
    { _id: req.user._id, "tasks._id": taskID },
    { $pull: { tasks: { _id: taskID } } }
  );

  if (result.nModified) {
    res.status(200).json({
      status: "success",
      message: "task deleted successfuly",
    });
  } else {
    res.status(404).json({
      status: "failure",
      error_code: "not-found",
      error: ["task not found"],
    });
  }
});

//add new task item
router.post("/:taskID", verifyToken, async (req, res) => {
  const taskID = req.params.taskID;
  const { error } = taskItemValidation(req.body);
  if (error) {
    let result = _.map(error.details, "message");
    result = _.map(result, (s) => s.replace(/['"]+/g, ""));
    return res.status(400).json({
      status: "failure",
      error_code: "joi-fails",
      error: result,
    });
  }

  const item = req.body;
  try {
    const data = await User.findOneAndUpdate(
      { _id: req.user._id, "tasks._id": taskID },
      { $push: { "tasks.$.items": item } },
      { fields: { username: 1, email_address: 1, tasks: 1 }, new: true }
    );
    res.status(201).json({
      status: "success",
      message: "new item added",
      data: data,
    });
  } catch (error) {
    return res.status(404).json({
      status: "failure",
      error_code: "not-found",
      error: ["task not found"],
    });
  }
});

//update task item
router.put("/:taskID/:itemID", verifyToken, async (req, res) => {
  const taskID = req.params.taskID;
  const itemID = req.params.itemID;
  console.log(taskID, itemID);
  // const { error } = taskItemValidation(req.body);
  // if (error) {
  //   let result = _.map(error.details, "message");
  //   result = _.map(result, (s) => s.replace(/['"]+/g, ""));
  //   return res.status(400).json({
  //     status: "failure",
  //     error_code: "joi-fails",
  //     error: result,
  //   });
  // }

  const item = req.body;

  try {
    const path = `tasks.$_id.items`;
    console.log(path);
    const data = await User.findOneAndUpdate(
      {
        $and: [
          {
            items: {
              $in: [itemID],
            },
          },
          {
            _id: req.user._id,
          },
          {
            "tasks._id": taskID,
          },
        ],
      },
      {
        $set: { completed: true },
      }
    );
    console.log(data);
    res.status(201).json({
      status: "success",
      message: "item updated",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      status: "failure",
      error_code: "not-found",
      error: ["task item not found"],
    });
  }
});

//delete task item
router.delete("/:taskID/:itemID", verifyToken, async (req, res) => {
  const taskID = req.params.taskID;
  const itemID = req.params.itemID;

  try {
    const data = await User.findOneAndUpdate(
      { _id: req.user._id, "tasks._id": taskID },
      { $pull: { "tasks.$.items": { _id: itemID } } },
      { new: true }
    );
    res.status(201).json({
      status: "success",
      message: "item updated",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      status: "failure",
      error_code: "not-found",
      error: ["task item not found"],
    });
  }
});

module.exports = router;

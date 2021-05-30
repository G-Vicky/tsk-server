const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  items: Joi.array().items({
    title: Joi.string().min(3).max(255),
  }),
}).options({ abortEarly: false });

const taskItemSchema = Joi.object({
  items: Joi.array().items({
    title: Joi.string().min(3).max(255),
  }),
});

function taskValidation(task) {
  return taskSchema.validate(task);
}

function taskItemValidation(item) {
  return taskItemSchema.validate(item);
}

module.exports.taskValidation = taskValidation;
module.exports.taskItemValidation = taskItemValidation;

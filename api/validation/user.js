const Joi = require("joi");

const newUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email_address: Joi.string().min(3).max(30).required().email(),
  password: Joi.string().min(3).max(30).required(),
}).options({ abortEarly: false });

const userSchema = Joi.object({
  email_address: Joi.string().min(3).max(30).required().email(),
  password: Joi.string().min(3).max(30).required(),
}).options({ abortEarly: false });

function newUserValidation(user) {
  return newUserSchema.validate(user);
}

function userValidation(user) {
  return userSchema.validate(user);
}

module.exports.newUserValidation = newUserValidation;
module.exports.userValidation = userValidation;

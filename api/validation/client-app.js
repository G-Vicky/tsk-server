const Joi = require("joi");

const newAppSchema = Joi.object({
  app_name: Joi.string().min(3).max(30).required(),
}).options({ abortEarly: false });

function clientAppValidation(name) {
  return newAppSchema.validate(name);
}
module.exports.clientAppValidation = clientAppValidation;

import Joi from "joi";

const urlSchemaValidation = Joi.object({
  url: Joi.string().required(),
  joiner: Joi.string().required(),
  userID: Joi.string().required(),
});

const userRegisterValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
  userID: Joi.string().required(),
});

const userLoginValidation = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export { urlSchemaValidation, userRegisterValidation, userLoginValidation };

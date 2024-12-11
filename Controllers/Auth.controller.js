import createError from "http-errors";

import { generateOTP, randomStr } from "../Helpers/index.js";
import {
  userRegisterValidation,
  userLoginValidation,
} from "../Helpers/validations.js";
import Url from "../Models/Url.model.js";
import User from "../Models/User.model.js";
import { sendVerificationLink } from "../Helpers/mail_helper.js";
import tempStorage from "../Helpers/OTPstorage.js";

export default {
  register: async (req, res, next) => {
    try {
      const result = await userRegisterValidation.validateAsync(req.body);

      const doesExist = await User.findOne({ email: result.email });
      if (doesExist)
        throw createError.Conflict(
          `${result.email} had already been registerd. `
        );

      const newUser = new User(result);
      await newUser.save();

      const otp = generateOTP();
      tempStorage.set(result.email, otp);

      await sendVerificationLink(result.email, otp)
        .then((info) => res.send("EMail Sent: Verify and Check your Email"))
        .catch((error) => {
          throw createError.InternalServerError(error.message);
        });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await userLoginValidation.validateAsync(req.body);

      res.send(result);
      res.send("Login Route");
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      res.send("GET Auth Route");
    } catch (error) {
      next(error);
    }
  },
  getTempToken: async (req, res, next) => {
    try {
      let doesExist = true;
      let tempToken;
      while (doesExist) {
        tempToken = randomStr(24);
        doesExist = await Url.findOne({ tempToken });
      }

      res.send({ tempToken });
    } catch (error) {
      next(error);
    }
  },
};

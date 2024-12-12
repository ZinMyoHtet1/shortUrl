import createError from "http-errors";

import { randomStr } from "../Helpers/index.js";
import { generateToken, verifyToken } from "../Helpers/jwt_helper.js";
import {
  userRegisterValidation,
  userLoginValidation,
} from "../Helpers/validations.js";
import Url from "../Models/Url.model.js";
import User from "../Models/User.model.js";
import { sendVerificationEmail } from "../Helpers/mail_helper.js";
import veriStorage from "../Helpers/VeriStorage.js";

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

      // const otp = generateOTP();
      const id = randomStr(8);
      const token = await generateToken(
        {
          email: result.email,
          name: result.name,
        },
        process.env.ACCESS_TOKEN_SECRET
      );
      // tempStorage.set(result.email, otp);

      veriStorage.set(id, token);

      const verificationURL =
        process.env.NODE_ENV === "production"
          ? `https://shorturlbyjys.onrender.com/auth/verify/${id}`
          : `http://localhost:${process.env.PORT}/auth/verify/${id}`;

      await sendVerificationEmail(result.email, verificationURL)
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

  verify: async (req, res, next) => {
    try {
      const { verifyID } = req.params;
      if (!verifyID) throw createError.BadRequest();

      const token = veriStorage.get(verifyID);

      await verifyToken(token, process.env.ACCESS_TOKEN_SECRET)
        .then(async (result) => {
          const updatedUser = await User.findOneAndUpdate(
            { email: result.email },
            { $set: { isVerified: true } },
            { new: true }
          );
          if (updatedUser) {
            res.status(200).send({
              status: "success",
              message: "Successful Verification Email",
              paylaod: updatedUser,
            });
          } else {
            res.status(401).send({
              status: "fail",
              message: "Verification Failed!",
            });
          }
        })
        .catch((error) => {
          throw createError.InternalServerError(error.message);
        });
    } catch (error) {
      next(error);
    }
  },
};

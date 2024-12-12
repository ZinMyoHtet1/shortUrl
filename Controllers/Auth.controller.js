import createError from "http-errors";

import { randomStr } from "../Helpers/index.js";
import { generateToken, verifyToken } from "../Helpers/jwt_helper.js";
import {
  userRegisterValidation,
  userLoginValidation,
} from "../Helpers/validations.js";
import Url from "../Models/Url.model.js";
import User from "../Models/User.model.js";
import { verifyEmail } from "../Helpers/index.js";

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

      //For Verification Email
      await verifyEmail(result.email, result.name)
        .then((info) => {
          console.log(info, "info");
          res.send({
            status: "success",
            payload: info,
            message: "EMail Sent: Verify and Check your Email",
          });
        })
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

      const user = await User.findOne({ email: result.email });
      if (!user)
        throw createError.Conflict(`${result.email} is not registerd. `);

      const isMatch = await user.isValidatePassword(result.password);
      if (!isMatch) throw createError.Unauthorized();

      if (!user.isVerified) {
        //For Verification Email
        await verifyEmail(result.email, result.name)
          .then((info) => {
            console.log(info, "info");
            res.send({
              status: "success",
              payload: info,
              message: "EMail Sent: Verify and Check your Email",
            });
          })
          .catch((error) => {
            throw createError.InternalServerError(error.message);
          });
      } else {
        const accessToken = await generateToken(
          updatedUser,
          process.env.ACCESS_TOKEN_SECRET,
          "1h"
        );
        const refreshToken = await generateToken(
          updatedUser,
          process.env.REFRESH_TOKEN_SECRET,
          "1y"
        );

        res.send({
          status: "success",
          message: "Successful Login",
          payload: { accessToken, refreshToken },
        });
      }
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

      await verifyToken(token, process.env.VERIFY_TOKEN_SECRET)
        .then(async (result) => {
          const updatedUser = await User.findOneAndUpdate(
            { email: result.email },
            { $set: { isVerified: true } },
            { new: true }
          );

          // console.log(updatedUser, "updatedUser payload");
          if (updatedUser) {
            const { name, email, userID } = updatedUser;

            const accessToken = await generateToken(
              { name, email, userID },
              process.env.ACCESS_TOKEN_SECRET,
              "1h"
            );
            const refreshToken = await generateToken(
              { name, email, userID },
              process.env.REFRESH_TOKEN_SECRET,
              "1y"
            );

            res.status(200).send({
              status: "success",
              message: "Successful Verification Email",
              paylaod: { accessToken, refreshToken },
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

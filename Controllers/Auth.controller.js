import createError from "http-errors";

import {
  isValidOTP,
  randomStr,
  sendOtpToEmail,
  verifyEmailAndUpdateUser,
} from "../Helpers/index.js";
import {
  userRegisterValidation,
  userLoginValidation,
} from "../Helpers/validations.js";
import Url from "../Models/Url.model.js";
import User from "../Models/User.model.js";
import { verificationEmail } from "../Helpers/index.js";
import { validEmail } from "../Helpers/validations.js";
import { hashPassword } from "../Helpers/bcrypt_helper.js";
import { generateToken } from "../Helpers/jwt_helper.js";

const userVerifiedOrLogin = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!user.isVerified) {
        //For Verification Email
        const info = await verificationEmail(user.email, user.name);
        resolve(info);
      } else {
        const accessToken = await generateToken(
          {
            name: user.name,
            email: user.email,
            userID: user.userID,
          },
          process.env.ACCESS_TOKEN_SECRET,
          "1h"
        );
        const refreshToken = await generateToken(
          {
            name: user.name,
            email: user.email,
            userID: user.userID,
          },
          process.env.REFRESH_TOKEN_SECRET,
          "1y"
        );
        resolve({ accessToken, refreshToken });
      }
    } catch (error) {
      reject(createError.InternalServerError(error.message));
    }
  });
};

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
      await verificationEmail(result.email, result.name)
        .then((info) => {
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
        const info = await userVerifiedOrLogin(user);

        res.send({
          status: "success",
          payload: info,
          message: "EMail Sent: Verify and Check your Email",
        });
      } else {
        const tokens = await userVerifiedOrLogin(user);

        res.send({
          status: "success",
          message: "Successful Login",
          payload: tokens,
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

  verifyEmail: async (req, res, next) => {
    try {
      const { verifyID } = req.params;
      if (!verifyID) throw createError.BadRequest();

      const updatedUser = await verifyEmailAndUpdateUser(verifyID);
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
          payload: { accessToken, refreshToken },
        });
      } else {
        res.status(401).send({
          status: "fail",
          message: "Verification Failed!",
        });
      }
    } catch (error) {
      next(error);
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      const email = await validEmail.validateAsync(req.body?.email);

      const doesExist = await User.findOne({ email });
      if (!doesExist) throw createError.NotFound(`${email} is not registered.`);

      await sendOtpToEmail(email)
        .then((info) => res.send("OTP Sent : " + info.response))
        .catch((error) => {
          throw createError.InternalServerError(error.message);
        });
    } catch (error) {
      next(error);
    }
  },

  verifyOTP: async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!otp && !email && !newPassword) throw createError.BadRequest();
      const result = await userLoginValidation.validateAsync({
        email,
        password: newPassword,
      });
      const user = await User.findOne({ email: result.email });
      if (!user)
        throw createError.NotFound(`${result.email} is not registered`);

      const isMatch = await isValidOTP(result.email, otp);
      if (!isMatch) throw createError.Unauthorized("Incorrect OTP");

      const hashedPassword = await hashPassword(newPassword);

      const updatedUser = await User.findOneAndUpdate(
        { email: result.email },
        { $set: { password: hashedPassword } }
      );

      if (!updatedUser.isVerified) {
        const info = await userVerifiedOrLogin(updatedUser);

        res.send({
          status: "success",
          payload: info,
          message: "EMail Sent: Verify and Check your Email",
        });
      } else {
        const tokens = await userVerifiedOrLogin(updatedUser);
        res.send({
          status: "success",
          message: "Successful Login",
          payload: tokens,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};

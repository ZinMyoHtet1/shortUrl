import crypto from "crypto";
import fs from "fs";
import path, { resolve } from "path";
import * as url from "url";
import otpStorage from "./OTPstorage.js";
import { sendOTP, sendVerificationEmail } from "./mail_helper.js";
import { generateToken, verifyToken } from "./jwt_helper.js";
import veriStorage from "./VeriStorage.js";
import createError from "http-errors";
import User from "../Models/User.model.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const readFileSync = (filePath) => {
  return fs.readFileSync(path.join(__dirname, filePath), "utf8");
};

const randomStr = (length) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .slice(0, length)
    .replace(/[^a-zA-Z0-9]/g, "");
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
};

const createMongoDbUri = (username, password, cluster, dbName) => {
  return `mongodb+srv://${username}:${password}@${cluster}.umdux.mongodb.net/${dbName}`;
};

function verificationEmail(email, name) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = randomStr(8);
      const token = await generateToken(
        {
          email,
          name,
        },
        process.env.VERIFY_TOKEN_SECRET,
        "5min" //5mins
      );

      veriStorage.set(id, token);

      const verificationURL =
        process.env.NODE_ENV === "production"
          ? `https://shorturlbyjys.onrender.com/auth/verify/${id}`
          : `http://localhost:${process.env.PORT}/auth/verify/${id}`;

      const info = await sendVerificationEmail(email, verificationURL);
      resolve(info);
    } catch (error) {
      reject(createError.InternalServerError(error.message));
    }
  });
}

function verifyEmailAndUpdateUser(verifyID) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = veriStorage.get(verifyID);

      const result = await verifyToken(token, process.env.VERIFY_TOKEN_SECRET);
      const updatedUser = await User.findOneAndUpdate(
        { email: result.email },
        { $set: { isVerified: true } },
        { new: true }
      );
      resolve(updatedUser);
    } catch (error) {
      reject(createError.InternalServerError(error.message));
    }
  });
}

async function sendOtpToEmail(email) {
  const otp = generateOTP();
  otpStorage.set(email, otp);

  return await sendOTP(email, otp);
}

async function isValidOTP(email, otp) {
  return otpStorage.verify(email, otp);
}
export {
  createMongoDbUri,
  randomStr,
  generateOTP,
  __dirname,
  readFileSync,
  verificationEmail,
  sendOtpToEmail,
  isValidOTP,
  verifyEmailAndUpdateUser,
};

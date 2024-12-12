import crypto from "crypto";
import fs from "fs";
import path from "path";
import * as url from "url";

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

async function verifyEmail(email, name) {
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

  return await sendVerificationEmail(email, verificationURL);
}

export {
  createMongoDbUri,
  randomStr,
  generateOTP,
  __dirname,
  readFileSync,
  verifyEmail,
};

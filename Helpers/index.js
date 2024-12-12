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

export { createMongoDbUri, randomStr, generateOTP, __dirname, readFileSync };

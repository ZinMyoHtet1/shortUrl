import crypto from "crypto";

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

export { createMongoDbUri, randomStr, generateOTP };

import crypto from "crypto";
import Url from "../Models/Url.model.js";

const randomStr = (length) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .slice(0, 8)
    .replace(/[^a-zA-Z0-9]/g, "");
};

const createMongoDbUri = (username, password, cluster, dbName) => {
  return `mongodb+srv://${username}:${password}@${cluster}.umdux.mongodb.net/${dbName}`;
};

export { createMongoDbUri, randomStr };

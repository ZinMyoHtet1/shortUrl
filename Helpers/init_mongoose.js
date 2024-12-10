import mongoose from "mongoose";
import { createMongoDbUri } from "./index.js";

const { DB_USERNAME, DB_PASSWORD, CLUSTER, DB_NAME } = process.env;

const mongodb_uri = createMongoDbUri(
  DB_USERNAME,
  DB_PASSWORD,
  CLUSTER,
  DB_NAME
);

mongoose.connect(mongodb_uri).then(() => console.log("connected to mongodb"));

mongoose.connection.on("connected", () =>
  console.log("mongoose connects to db")
);
mongoose.connection.on("disconnected", () =>
  console.log("mongoose disconnects to db")
);

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.close(0);
});

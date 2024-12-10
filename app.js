import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";

import adminAccess from "./Middlewares/adminAccess.js";
import "./Helpers/init_mongoose.js";

import {
  createShortUrl,
  getRootUrl,
  getShortUrls,
} from "./Controllers/Index.controller.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("Welcome from Short URL API");
});

app.get("/shortUrls", adminAccess, getShortUrls);

app.post("/create", createShortUrl);

app.get("/:urlID", getRootUrl);

app.use(async (req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status = err.status || 500;

  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(port, () => {
  console.log("your server is running");
});

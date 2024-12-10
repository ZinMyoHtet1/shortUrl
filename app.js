import express from "express";
import createError from "http-errors";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";

import "./Helpers/init_mongoose.js";
import { randomStr } from "./Helpers/index.js";
import { generateToken, verifyToken } from "./Helpers/jwt_helper.js";
import Url from "./Models/Url.model.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("Welcome from Short URL API");
});

app.get("/urls", async (req, res) => {
  try {
    await Url.find()
      .then((results) => res.send(results))
      .catch((error) => {
        throw createError.InternalServerError(error.message);
      });
  } catch (error) {
    next(error);
  }
});

app.post("/create", async (req, res, next) => {
  try {
    const { url, joiner } = req.body;
    if (!url && !join_text) {
      return reject(createError.BadRequest());
    }

    const id = randomStr(12);
    const token = await generateToken(req.body);

    const urlID = `${joiner}.${id}`;

    const shortUrl = new Url({
      urlID,
      token,
    });

    const savedShortUrl = await shortUrl.save();
    if (process.env.NODE_ENV === "production") {
      res.send({
        status: SUCCESS,
        message: "Short Url is created successfully",
        url: `http://localhost:${process.env.PORT || 3000}/${urlID}`,
      });
    } else {
      res.send({
        savedShortUrl,
        shortUrl: `http://localhost:${process.env.PORT || 3000}/${urlID}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/:id", async (req, res, next) => {
  try {
    const urlID = req.params.id;
    if (!urlID) throw createError.BadRequest();

    const url = await Url.findOne({ urlID });
    if (!url) throw createError.NotFound("this link is not registered");

    const rootUrl = await verifyToken(url?.token);

    if (process.env.NODE_ENV === "production") {
      res.redirect(rootUrl);
    } else {
      res.send({
        status: "success",
        rootUrl,
      });
    }
  } catch (error) {
    next(error);
  }
});

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

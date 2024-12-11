import createError from "http-errors";
import { randomStr } from "../Helpers/index.js";
import { generateToken, verifyToken } from "../Helpers/jwt_helper.js";
import Url from "../Models/Url.model.js";
import { urlSchemaValidation } from "../Helpers/validations.js";

const getShortUrls = async (req, res, next) => {
  try {
    await Url.find()
      .then((results) => res.send(results))
      .catch((error) => {
        throw createError.InternalServerError(error.message);
      });
  } catch (error) {
    next(error);
  }
};

const getShortUrlsByUserID = async (req, res, next) => {
  try {
    const { userID } = req.params;
    if (!userID) throw createError.BadRequest();
    await Url.find({ userID })
      .then((results) => res.send(results))
      .catch((error) => {
        throw createError.InternalServerError(error.message);
      });
  } catch (error) {
    next(error);
  }
};

const createShortUrl = async (req, res, next) => {
  try {
    // const { url, joiner, userID } = req.body;
    const result = await urlSchemaValidation.validateAsync(req.body);
    // if (!url && !joiner) {
    //   throw createError.BadRequest();
    //   return;
    // }

    const id = randomStr(8);
    const token = await generateToken(result);

    const urlID = `${result.joiner}${id}`;

    console.log(result.userID);

    const shortUrl = new Url({
      urlID,
      token,
      userID: result.userID,
    });

    const savedShortUrl = await shortUrl.save();
    if (process.env.NODE_ENV === "production") {
      res.send({
        status: "success",
        message: "Short Url is created successfully",
        url: `https://shorturlbyjys.onrender.com/${urlID}`,
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
};

const getRootUrl = async (req, res, next) => {
  try {
    const urlID = req.params.urlID;
    if (!urlID) throw createError.BadRequest();

    const url = await Url.findOne({ urlID });
    if (!url) throw createError.NotFound();

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
};
export { getShortUrls, createShortUrl, getRootUrl, getShortUrlsByUserID };

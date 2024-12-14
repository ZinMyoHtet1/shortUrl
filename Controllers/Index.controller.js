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
    const token = await generateToken(result, process.env.URL_TOKEN_SECRET);

    const urlID = `${result.joiner}${id}`;

    const shortUrl = new Url({
      urlID,
      token,
      userID: result.userID,
    });

    await shortUrl.save();

    res.send({
      status: "success",
      message: "Short Url is created successfully",
      url: `https://shorturlbyjys.onrender.com/${urlID}`,
    });
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

    const payload = await verifyToken(url?.token, process.env.URL_TOKEN_SECRET);

    if (process.env.NODE_ENV === "production") {
      res.redirect(payload.url);
    } else {
      res.send({
        status: "success",
        rootUrl: payload.url,
      });
    }
  } catch (error) {
    next(error);
  }
};

const getTempToken = async (req, res, next) => {
  try {
    let doesExist = true;
    let tempToken;
    while (doesExist) {
      tempToken = randomStr(24);
      doesExist = await Url.findOne({ tempToken });
    }

    res.send({
      status: "success",
      message: "temporary token is created",
      tempToken,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getShortUrls,
  createShortUrl,
  getRootUrl,
  getShortUrlsByUserID,
  getTempToken,
};

import JWT from "jsonwebtoken";
import createError from "http-errors";

export const generateToken = (payload) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      payload,
      process.env.URL_TOKEN_SECRET,
      {
        algorithm: "HS256",
      },
      (err, token) => {
        if (err) {
          reject(createError.InternalServerError(err.message));
          return;
        }
        resolve(token);
      }
    );
  });
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.URL_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        reject(createError.InternalServerError(error.message));
        return;
      }
      resolve(decoded.url);
    });
  });
};

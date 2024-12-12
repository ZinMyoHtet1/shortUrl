import JWT from "jsonwebtoken";
import createError from "http-errors";

export const generateToken = (payload, secret, expiresIn = 0) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      payload,
      secret,
      {
        algorithm: "HS256",
        expiresIn,
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

export const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, secret, (error, decoded) => {
      if (error) {
        reject(createError.InternalServerError(error.message));
        return;
      }
      resolve(decoded);
    });
  });
};

import JWT from "jsonwebtoken";

export const generateToken = (payload, secret, duration = "9999999999y") => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      payload,
      secret,
      {
        algorithm: "HS256",
        expiresIn: duration,
      },
      (err, token) => {
        if (err) {
          reject(err);
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
        reject(error);
        return;
      }
      resolve(decoded);
    });
  });
};

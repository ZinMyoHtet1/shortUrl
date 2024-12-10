const adminAccess = (req, res, next) => {
  const bearerAuthorization = req.headers["authorization"];

  const authorization = bearerAuthorization.split(" ")[1];
  console.log(authorization);
  if (authorization === process.env.ADMIN_ACCESS) {
    req.admin = true;
    next();
  } else {
    res.status(401).send({
      status: 401,
      message: "You can't access this route",
    });
  }
};

export default adminAccess;

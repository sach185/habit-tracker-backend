const jwt = require("jsonwebtoken");
const config = require("./config");

//Sign user info object with jwt
module.exports.getToken = (userInfo) => {
  console.log("token info : ", userInfo);
  return jwt.sign(userInfo, config.JWT_SECRET, { expiresIn: "24h" });
};

//Middleware to check if user is authorized by validating token
module.exports.getAuthUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, config.JWT_SECRET, (err, decode) => {
      if (err) {
        return res
          .status(401)
          .send({ error: "Auth error", msg: "Invalid token" });
      }
      req.user = decode;
      next();
      return;
    });
  } else {
    return res
      .status(401)
      .send({ error: "Auth error", msg: "Token not found" });
  }
};

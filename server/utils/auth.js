const { verify, sign } = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.SECRET;
const expiration = "24h";

function authMiddleware({ req }) {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch (e) {
    console.log("Invalid token!");
  }

  return req;
}

function signToken({ email, _id }) {
  const payload = { email, _id };

  return sign({ data: payload }, secret, { expiresIn: expiration });
}

module.exports = { authMiddleware, signToken };

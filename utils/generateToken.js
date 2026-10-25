const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
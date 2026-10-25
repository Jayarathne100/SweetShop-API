const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
};

module.exports = config;
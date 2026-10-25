const express = require("express");

const {
  getDashboardStats,
} = require("../controller/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  admin,
  getDashboardStats
);

module.exports = router;
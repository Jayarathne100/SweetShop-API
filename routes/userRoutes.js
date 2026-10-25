const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getUsers,
  getUserById,
  deleteUser,
} = require("../controller/userController");

// Admin-only routes
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
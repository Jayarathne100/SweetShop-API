const express = require("express");
const router = express.Router();

const {
  getAllContacts,
  createContact,
  markContactAsRead,
  deleteContact,
} = require("../controller/contactController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public contact form
router.post("/", createContact);

// Admin-only operations
router.get("/", protect, admin, getAllContacts);
router.patch("/:id/read", protect, admin, markContactAsRead);
router.delete("/:id", protect, admin, deleteContact);

module.exports = router;
const mongoose = require("mongoose");
const User = require("../models/User");

// GET /api/users
// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to retrieve users",
    });
  }
};

// GET /api/users/:id
// Get one user (admin only)
const getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to retrieve user",
    });
  }
};

// DELETE /api/users/:id
// Delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Prevent the logged-in admin from deleting their own account.
    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        message: "You cannot delete your own administrator account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Protect administrator accounts from deletion through this endpoint.
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Administrator accounts cannot be deleted here",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
};
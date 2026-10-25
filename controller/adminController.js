const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const salesResult = await Order.aggregate([
      {
        $match: {
          status: {
            $in: ["Completed", "Delivered"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
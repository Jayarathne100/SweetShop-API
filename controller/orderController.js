const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Create an order from the logged-in customer's cart
const createOrder = async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      deliveryFee = 0,
      paymentMethod = "Cash on Delivery",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    if (
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !shippingAddress?.trim()
    ) {
      return res.status(400).json({
        message: "Customer name, phone, and delivery address are required",
      });
    }

    if (
      !Number.isFinite(Number(deliveryFee)) ||
      Number(deliveryFee) < 0
    ) {
      return res.status(400).json({
        message: "Invalid delivery fee",
      });
    }

    if (paymentMethod !== "Cash on Delivery") {
      return res.status(400).json({
        message: "Unsupported payment method",
      });
    }

    const normalizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.product || item.productId || item._id;
      const quantity = Number(item.quantity);

      if (
        !mongoose.isValidObjectId(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity in the cart",
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${productId}`,
        });
      }

      if (product.isAvailable === false || product.stock < quantity) {
        return res.status(400).json({
          message: `${product.name} is unavailable or has insufficient stock`,
        });
      }

      const itemTotal = product.price * quantity;
      subtotal += itemTotal;

      normalizedItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
        image: product.image || "",
      });
    }

    const totalPrice = subtotal + Number(deliveryFee);

    const order = await Order.create({
      user: req.user._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail || req.user.email || "",
      shippingAddress: shippingAddress.trim(),
      items: normalizedItems,
      subtotal,
      deliveryFee: Number(deliveryFee),
      totalPrice,
      paymentMethod,
      status: "Pending",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// Get all orders for the admin panel
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get orders belonging to the logged-in customer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your orders",
      error: error.message,
    });
  }
};

// Get one order (admin)
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Delete order (admin)
const deleteOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
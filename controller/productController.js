const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get one product
const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Create a product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({ message: "Enter a valid product price" });
    }

    if (!["Sweets", "Cakes", "Cool Drinks"].includes(category)) {
      return res.status(400).json({ message: "Invalid product category" });
    }

    const numericStock =
      stock === undefined || stock === "" ? 0 : Number(stock);

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a product image",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      category,
      stock: numericStock,
      image: `/uploads/products/${req.file.filename}`,
      isAvailable: true,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    // Remove the uploaded image if product creation fails.
    if (req.file) {
      fs.unlink(
        path.join(__dirname, "../uploads/products", req.file.filename),
        () => {}
      );
    }

    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, description, price, category, stock, isAvailable } =
      req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Product name cannot be empty",
        });
      }

      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          message: "Enter a valid product price",
        });
      }

      product.price = Number(price);
    }

    if (category !== undefined) {
      if (!["Sweets", "Cakes", "Cool Drinks"].includes(category)) {
        return res.status(400).json({
          message: "Invalid product category",
        });
      }

      product.category = category;
    }

    if (stock !== undefined) {
      if (
        stock === "" ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
      ) {
        return res.status(400).json({
          message: "Stock must be a non-negative whole number",
        });
      }

      product.stock = Number(stock);
    }

    if (isAvailable !== undefined) {
      if (isAvailable === "true" || isAvailable === true) {
        product.isAvailable = true;
      } else if (isAvailable === "false" || isAvailable === false) {
        product.isAvailable = false;
      }
    }

    if (req.file) {
      const oldImage = product.image;
      product.image = `/uploads/products/${req.file.filename}`;

      // Delete the previous locally stored image after saving the update.
      await product.save();

      if (oldImage && oldImage.startsWith("/uploads/products/")) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          oldImage.replace(/^\//, "")
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, () => {});
        }
      }

      return res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(
        path.join(__dirname, "../uploads/products", req.file.filename),
        () => {}
      );
    }

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const image = product.image;

    await Product.findByIdAndDelete(req.params.id);

    if (image && image.startsWith("/uploads/products/")) {
      const imagePath = path.join(
        __dirname,
        "..",
        image.replace(/^\//, "")
      );

      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, () => {});
      }
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
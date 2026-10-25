
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API health check
app.get("/", (req, res) => {
  res.send("SweetSpot API is running");
});

// Application routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(
        `SweetSpot server running on http://localhost:${PORT}`
      );
      console.log(
        `Product images available at http://localhost:${PORT}/uploads/`
      );
    });
  } catch (error) {
    console.error("Failed to start SweetSpot server:", error);
    process.exit(1);
  }
};

startServer();

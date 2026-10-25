const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const config = require("../config/config");

const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);

    console.log("MongoDB connected");

    const adminExists = await User.findOne({
      email: "admin@sweetspot.com",
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@12345",
      10
    );

    const admin = await User.create({
      name: "SweetSpot Admin",
      email: "admin@sweetspot.com",
      password: hashedPassword,
      phone: "",
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log(`Email: ${admin.email}`);
    console.log("Password: Admin@12345");

    process.exit(0);
  } catch (error) {
    console.error(
      `Failed to create admin: ${error.message}`
    );

    process.exit(1);
  }
};

createAdmin();
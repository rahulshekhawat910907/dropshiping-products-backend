const User = require("../models/user");

const createAdmin = async (req, res) => {
  try {
    const { phone, name } = req.body || {};

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    let user = await User.findOne({ phone });

    // Agar user nahi hai to create karo
    if (!user) {
      user = await User.create({
        name: name || "Admin",
        phone,
        role: "admin",
      });

      return res.status(201).json({
        success: true,
        message: "Admin created successfully",
        user,
      });
    }

    // Agar already admin hai
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "This user is already an admin",
      });
    }

    // Existing user ko admin banao
    user.role = "admin";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user,
    });
  } catch (error) {
    console.error("Create Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAdmin,
};
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    let token;

    // =========================
    // GET TOKEN
    // =========================
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // =========================
    // NO TOKEN
    // =========================
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }

    // =========================
    // VERIFY TOKEN
    // =========================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded Token:", decoded);

    // =========================
    // CHECK USER ID
    // =========================
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid token.",
      });
    }

    // =========================
    // FIND USER
    // =========================
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    // =========================
    // SET USER
    // =========================
    req.user = user;

    next();

  } catch (error) {
    console.log("Protect Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid or expired token.",
    });
  }
};

// =========================
// ADMIN MIDDLEWARE
// =========================
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

module.exports = {
  protect,
  admin,
};
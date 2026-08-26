const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Phone Number
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // OTP
    otp: {
      type: String,
      default: null,
    },

    // OTP Expiry
    otpExpiry: {
      type: Date,
      default: null,
    },

    // Account Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    // User Role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;
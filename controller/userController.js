const User = require("../models/user");
const jwt = require("jsonwebtoken");

// =====================================================
// SEND OTP
// =====================================================
const sendOtp = async (req, res) => {
  try {
    const { phone, type, name } = req.body || {};

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const phoneNumber = Number(phone);

    if (
      !phoneNumber ||
      phone.toString().length !== 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid 10 digit phone number is required",
      });
    }

    // ============================
    // REGISTER
    // ============================

    if (type === "register") {

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const exist = await User.findOne({
        phone: phoneNumber,
      });

      if (exist) {
        return res.status(400).json({
          success: false,
          message: "Your number already exists",
        });
      }

      const user = await User.create({
        name: name.trim(),
        phone: phoneNumber,
        role: "user",
      });

      const otp = "123456";

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        otp,
        user,
        userId: user._id,
      });
    }

    // ============================
    // LOGIN
    // ============================

    if (type === "login") {

      const exist = await User.findOne({
        phone: phoneNumber,
      });

      if (!exist) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please register first",
        });
      }

      const otp = "123456";

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        otp,
        user: exist,
        userId: exist._id,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Request type is required",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// VERIFY OTP & LOGIN
// =====================================================
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body || {};

    console.log("VERIFY BODY:", req.body);

    // =================================================
    // VALIDATION
    // =================================================
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const phoneNumber = Number(phone);

    if (!phoneNumber || phone.toString().length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Valid 10 digit phone number is required",
      });
    }

    // =================================================
    // FIND USER BY PHONE
    // =================================================
    const user = await User.findOne({
      phone: phoneNumber,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first",
      });
    }

    // =================================================
    // CHECK OTP
    // =================================================
    if (otp.toString() !== "123456") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =================================================
    // JWT TOKEN
    // =================================================
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // =================================================
    // SUCCESS
    // =================================================
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL USERS
// =====================================================
const totalUser = async (req, res) => {
  try {
    const users = await User.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET PROFILE
// =====================================================
const profile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================
const updateprofile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: "Name or phone is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) {
      user.name = name.trim();
    }

    if (phone) {
      user.phone = Number(phone);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE USER
// =====================================================
const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  sendOtp,
  verifyOtp,
  profile,
  updateprofile,
  deleteProfile,
  totalUser,
};
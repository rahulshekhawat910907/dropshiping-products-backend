const User = require("../models/User");
const Address = require("../models/Address");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const mongoose = require("mongoose");

const createAdmin = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const cleanName = String(name || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanName || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Valid name and 10 digit phone are required",
      });
    }

    let user = await User.findOne({ phone: cleanPhone });

    if (user) {
      user.name = cleanName;
      user.role = "admin";
      await user.save();
    } else {
      user = await User.create({
        name: cleanName,
        phone: cleanPhone,
        role: "admin",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

// =====================================================
// GET ALL USERS
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      role,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    // =================================================
    // FILTER
    // =================================================

    const filter = {};

    // Search by name or phone
    if (search && search.trim()) {
      const searchValue = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }

    // Role filter
    if (
      role &&
      ["user", "admin"].includes(role)
    ) {
      filter.role = role;
    }

    // =================================================
    // GET USERS
    // =================================================

    const [users, total] =
      await Promise.all([
        User.find(filter)
          .select("-__v")
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        User.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,

      users,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "GET ALL USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE USER
// =====================================================

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // =================================================
    // USER
    // =================================================

    const user =
      await User.findById(id)
        .select("-__v")
        .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // ADDRESS
    // =================================================

    const addresses =
      await Address.find({
        user: id,
      })
        .sort({
          isDefault: -1,
          createdAt: -1,
        })
        .lean();

    // =================================================
    // CART
    // =================================================

    const cart =
      await Cart.findOne({
        user: id,
      }).lean();

    // =================================================
    // WISHLIST
    // =================================================

    const wishlist =
      await Wishlist.findOne({
        user: id,
      }).lean();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      user,

      addresses,

      cart: cart || {
        items: [],
      },

      wishlist: wishlist || {
        products: [],
      },
    });
  } catch (error) {
    console.error(
      "GET SINGLE USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE USER
// =====================================================

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      role,
    } = req.body;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // NAME
    // =================================================

    if (name !== undefined) {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = cleanName;
    }

    // =================================================
    // PHONE
    // =================================================

    if (phone !== undefined) {
      const cleanPhone =
        String(phone).replace(
          /\D/g,
          ""
        );

      if (
        !/^[0-9]{10}$/.test(
          cleanPhone
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must be 10 digits",
        });
      }

      // Check duplicate phone
      const existingUser =
        await User.findOne({
          phone: cleanPhone,
          _id: {
            $ne: id,
          },
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number already exists",
        });
      }

      user.phone = cleanPhone;
    }

    // =================================================
    // ROLE
    // =================================================

    if (role !== undefined) {
      if (
        !["user", "admin"].includes(
          role
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be user or admin",
        });
      }

      // Admin cannot remove own admin role
      if (
        req.user &&
        String(req.user._id) ===
          String(id) &&
        role !== "admin"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot remove your own admin role",
        });
      }

      user.role = role;
    }

    // =================================================
    // SAVE
    // =================================================

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "User updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE USER ROLE
// =====================================================

const changeUserRole = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // =================================================
    // VALIDATE ROLE
    // =================================================

    if (
      !["user", "admin"].includes(
        role
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be user or admin",
      });
    }

    // =================================================
    // PREVENT SELF ROLE CHANGE
    // =================================================

    if (
      req.user &&
      String(req.user._id) ===
        String(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own role",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // UPDATE ROLE
    // =================================================

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,

      message:
        `User role changed to ${role}`,

      user,
    });
  } catch (error) {
    console.error(
      "CHANGE USER ROLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change user role",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE USER
// =====================================================

const deleteUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // =================================================
    // PREVENT SELF DELETE
    // =================================================

    if (
      req.user &&
      String(req.user._id) ===
        String(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // DELETE USER
    // =================================================

    await User.findByIdAndDelete(id);

    // =================================================
    // DELETE ADDRESS
    // =================================================

    await Address.deleteMany({
      user: id,
    });

    // =================================================
    // DELETE CART
    // =================================================

    await Cart.deleteMany({
      user: id,
    });

    // =================================================
    // DELETE WISHLIST
    // =================================================

    await Wishlist.deleteMany({
      user: id,
    });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "User and related data deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete user",
      error: error.message,
    });
  }
};

// =====================================================
// USER STATISTICS
// =====================================================

const getUserStatistics = async (
  req,
  res
) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      total,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
      }),

      User.countDocuments({
        role: "admin",
      }),

      User.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,

      statistics: {
        total,
        users: totalUsers,
        admins: totalAdmins,
      },
    });
  } catch (error) {
    console.error(
      "USER STATISTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get user statistics",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createAdmin,
  getAllUsers,
  getSingleUser,
  updateUser,
  changeUserRole,
  deleteUser,
  getUserStatistics,
};
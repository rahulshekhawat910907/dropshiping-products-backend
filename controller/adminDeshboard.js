
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const Wishlist = require("../models/wishlist");
const Cart = require("../models/cart")

const adminDashboard = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments();

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Total Categories
    const totalCategories = await Category.countDocuments();

    // Total wishlist
    const totalWishlist = await Wishlist.countDocuments();

    //total cart
    const totalcart = await Cart.countDocuments();

    return res.json({
      success: true,
      message: "Admin dashboard fetched successfully",
      dashboard: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalWishlist,
        totalcart,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  adminDashboard,
};
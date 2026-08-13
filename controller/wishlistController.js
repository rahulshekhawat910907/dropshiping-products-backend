const Wishlist = require("../models/wishlist");
const Product = require("../models/product");

// ======================================
// ADD PRODUCT TO WISHLIST
// ======================================
const AddToWishlist = async (req, res) => {
  try {
    // User protect middleware se milega
    const userId = req.user?._id || req.user?.id;

    // Product frontend se aayega
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find user's wishlist
    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    // If wishlist doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });

      const populatedWishlist =
        await Wishlist.findById(wishlist._id).populate(
          "products"
        );

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        wishlist: populatedWishlist,
      });
    }

    // Check if product already exists
    const alreadyExists = wishlist.products.some(
      (item) =>
        item.toString() === productId.toString()
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add product
    wishlist.products.push(productId);

    await wishlist.save();

    const updatedWishlist =
      await Wishlist.findById(wishlist._id).populate(
        "products"
      );

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("Add Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// GET USER WISHLIST
// ======================================
const getWishlist = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    // Wishlist doesn't exist
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        count: 0,
        wishlist: [],
        products: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: wishlist.products.length,
      wishlist: wishlist,
      products: wishlist.products,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// REMOVE PRODUCT FROM WISHLIST
// ======================================
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Check product
    const exists = wishlist.products.some(
      (item) =>
        item.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove product
    wishlist.products = wishlist.products.filter(
      (item) =>
        item.toString() !== productId.toString()
    );

    await wishlist.save();

    const updatedWishlist =
      await Wishlist.findById(wishlist._id).populate(
        "products"
      );

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
      products: updatedWishlist.products,
    });
  } catch (error) {
    console.error("Remove Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  AddToWishlist,
  getWishlist,
  removeFromWishlist,
};
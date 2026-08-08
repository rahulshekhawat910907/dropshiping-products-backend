
const Wishlist = require("../models/wishlist");
const Product = require("../models/product");


const AddToWishlist = async (req, res) => {
  try {
    const { user, product } = req.body || {};

    if (!user ||!product) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check product
    const existProduct = await Product.findById(product);

    if (!existProduct) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user,
    });


    if (!wishlist) {
      wishlist = await Wishlist.create({
        user,
        products: [product],
      });

      return res.json({
        success: true,
        message: "Product added to wishlist",
        wishlist,
      });
    }


    const alreadyExist = wishlist.products.some(
      (item) => item.toString() === product.toString()
    );

    if (alreadyExist) {
      return res.json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add product
    wishlist.products.push(product);

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate("products");

    return res.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


const getWishlist = async (req, res) => {
  try {
    const {user} = req.body ||{}
    if(!user){
         return res.json({
      success: false,
      message: "user Id is required",
    });
    } 
    const wishlist = await Wishlist.findOne({
      user
    }).populate("products");

    if (!wishlist) {
      return res.json({
        success: true,
        wishlist: [],
      });
    }

    return res.json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const {user} = req.body ||{}
    const { productId } = req.params;

    if (!productId ) {
      return res.json({
        success: false,
        message: "productid is required",
      });
    }

    const wishlist = await Wishlist.findOne({
      user
    });

    if (!wishlist) {
      return res.json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Check product exists
    const exists = wishlist.products.some(
      (item) => item.toString() === productId.toString()
    );

    if (!exists) {
      return res.json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove product
    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productId.toString()
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate("products");

    return res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    return res.json({
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

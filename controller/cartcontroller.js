const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user");

// ========================================
// GET USER ID FROM PROTECT MIDDLEWARE
// ========================================
const getUserId = async (req) => {
  // Case 1: protect middleware already gives MongoDB user object
  if (req.user?._id) {
    return req.user._id;
  }

  // Case 2: protect middleware gives id
  if (req.user?.id) {
    return req.user.id;
  }

  if (req.user?.userId) {
    return req.user.userId;
  }

  // Case 3: JWT contains email
  if (req.user?.email) {
    const user = await User.findOne({
      email: req.user.email,
    });

    return user?._id;
  }

  // Case 4: req.user itself is an ID
  if (typeof req.user === "string") {
    return req.user;
  }

  return null;
};


// ========================================
// ADD TO CART
// ========================================
const addToCart = async (req, res) => {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { productId, quantity } = req.body || {};

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const qty = Number(quantity) || 1;

    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock
    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user: userId,
    });

    // ========================================
    // CREATE NEW CART
    // ========================================
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        products: [
          {
            product: productId,
            quantity: qty,
          },
        ],
      });

      const newCart = await Cart.findById(cart._id).populate(
        "products.product"
      );

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        cart: newCart,
      });
    }

    // ========================================
    // CHECK PRODUCT ALREADY IN CART
    // ========================================
    const existingProduct = cart.products.find(
      (item) =>
        item.product.toString() === productId.toString()
    );

    if (existingProduct) {
      const newQuantity =
        Number(existingProduct.quantity) + qty;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available`,
        });
      }

      existingProduct.quantity = newQuantity;
    } else {
      // Add new product
      cart.products.push({
        product: productId,
        quantity: qty,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "products.product"
    );

    return res.json({
      success: true,
      message: "Product added to cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// GET CART
// ========================================
const getCart = async (req, res) => {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    }).populate("products.product");

    // Empty cart
    if (!cart) {
      return res.json({
        success: true,
        count: 0,
        cart: {
          products: [],
        },
      });
    }

    return res.json({
      success: true,
      count: cart.products.length,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// UPDATE CART ITEM
// ========================================
const updateCartItem = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { productId } = req.params;
    const { quantity } = req.body || {};

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

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock
    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    // Find cart
    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item
    const cartItem = cart.products.find(
      (item) =>
        item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Update quantity
    cartItem.quantity = qty;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "products.product"
    );

    return res.json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// REMOVE CART ITEM
// ========================================
const removeCartItem = async (req, res) => {
  try {
    const userId = await getUserId(req);
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

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const exists = cart.products.some(
      (item) =>
        item.product.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.products = cart.products.filter(
      (item) =>
        item.product.toString() !== productId.toString()
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "products.product"
    );

    return res.json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// CLEAR CART
// ========================================
const clearCart = async (req, res) => {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.json({
        success: true,
        message: "Cart already empty",
        cart: {
          products: [],
        },
      });
    }

    cart.products = [];

    await cart.save();

    return res.json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// EXPORT
// ========================================
module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
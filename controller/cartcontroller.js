const Cart = require("../models/cart");
const Product = require("../models/product");

const addToCart = async (req, res) => {
  try {
    const { user, productId, quantity } = req.body || {};

    if (!user) {
      return res.json({
        success: false,
        message: "user Id is required",
      });
    }

    if (!productId) {
      return res.json({
        success: false,
        message: "product Id is required",
      });
    }

    const qty = Number(quantity) || 1;

    if (qty < 1) {
      return res.json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock
    if (product.stock < qty) {
      return res.json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user,
    });

    // Create new cart
    if (!cart) {
      cart = await Cart.create({
        user,
        products: [
          {
            product: productId,
            quantity: qty,
          },
        ],
      });

      const newCart = await Cart.findById(cart._id)
        .populate("products.product");

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        cart: newCart,
      });
    }

    // Check product already exists
    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingProduct) {
      const newQuantity = existingProduct.quantity + qty;

      if (newQuantity > product.stock) {
        return res.json({
          success: false,
          message: "Not enough stock available",
        });
      }

      existingProduct.quantity = newQuantity;
    } else {
      cart.products.push({
        product: productId,
        quantity: qty,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("products.product");

    return res.json({
      success: true,
      message: "Product added to cart",
      cart: updatedCart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const getCart = async (req, res) => {
  try {
      const {user} = req.body 
    if(!user){
         return res.json({
      success: false,
      message: "user Id is required",
    });
    } 
    const cart = await Cart.findOne({ user }).populate(
      "products.product"
    );

    if (!cart) {
      return res.json({
        success: true,
        cart: [],
      });
    }

    res.json({
      success: true,
      count: cart.length,
      cart,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};




const updateCartItem = async (req, res) => {
  try {
    const { user, quantity } = req.body || {};
    const { productId } = req.params;

    // User check
    if (!user) {
      return res.json({
        success: false,
        message: "user Id is required",
      });
    }

    // Product check
    if (!productId) {
      return res.json({
        success: false,
        message: "product Id is required",
      });
    }

    // Quantity check
    if (!quantity || Number(quantity) < 1) {
      return res.json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const qty = Number(quantity);

    // Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock
    if (qty > product.stock) {
      return res.json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Find cart
    const cart = await Cart.findOne({
      user,
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find product in cart
    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Update quantity
    cartItem.quantity = qty;

    await cart.save();

    // Populate updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate("products.product");

    return res.json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { user } = req.body || {};
    const { productId } = req.params;

    if (!user) {
      return res.json({
        success: false,
        message: "user Id is required",
      });
    }

    if (!productId) {
      return res.json({
        success: false,
        message: "product Id is required",
      });
    }

    const cart = await Cart.findOne({
      user,
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    const exists = cart.products.some(
      (item) => item.product.toString() === productId.toString()
    );

    if (!exists) {
      return res.json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("products.product");

    return res.json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const clearCart = async (req, res) => {
  try {
    const { user } = req.body || {};

    if (!user) {
      return res.json({
        success: false,
        message: "user Id is required",
      });
    }

    const cart = await Cart.findOne({
      user,
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
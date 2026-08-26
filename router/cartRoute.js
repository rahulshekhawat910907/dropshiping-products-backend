const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controller/cartcontroller");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET CART
// GET /api/cart
// =====================================================

router.get(
  "/",
  authMiddleware,
  getCart
);

// =====================================================
// ADD TO CART
// POST /api/cart/add
// =====================================================

router.post(
  "/add",
  authMiddleware,
  addToCart
);

// =====================================================
// UPDATE CART
// PUT /api/cart/update/:productId
// =====================================================

router.put(
  "/update/:productId",
  authMiddleware,
  updateCart
);

// =====================================================
// REMOVE
// DELETE /api/cart/remove/:productId
// =====================================================

router.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromCart
);

// =====================================================
// CLEAR
// DELETE /api/cart/clear
// =====================================================

router.delete(
  "/clear",
  authMiddleware,
  clearCart
);

module.exports = router;
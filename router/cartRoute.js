const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controller/cartcontroller");

const { protect } = require("../middleware/auth");


router.post("/create",protect, addToCart);
router.get("/all",protect,  getCart);
router.put("/update/:productId",protect, updateCartItem);
router.delete("/remove/:productId",protect, removeCartItem);


router.delete("/clear",protect , clearCart);

module.exports = router;
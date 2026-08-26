const express = require("express");

const {
  getWhatsappSettings,
  updateWhatsappSettings,
  createProductInquiry,
  createCartInquiry,
} = require("../controller/whatsappController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ======================================
// PUBLIC
// ======================================

router.get(
  "/settings",
  getWhatsappSettings
);

router.post(
  "/product-inquiry",
  createProductInquiry
);

// ======================================
// USER CART INQUIRY
// ======================================

router.post(
  "/cart-inquiry",
  authMiddleware,
  createCartInquiry
);

// ======================================
// ADMIN
// ======================================

router.put(
  "/settings",
  authMiddleware,
  adminMiddleware,
  updateWhatsappSettings
);

module.exports = router;
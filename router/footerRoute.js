const express = require("express");

const router = express.Router();

const {
  getFooter,
  updateFooter,
} = require("../controller/footerController");

// Public GET
router.get("/", getFooter);

// Admin update
router.put("/update", updateFooter);

module.exports = router;
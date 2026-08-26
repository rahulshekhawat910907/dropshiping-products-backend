const express = require("express");

const router = express.Router();

const {
  getNavbar,
  getAllNavbar,
  createNavbar,
  updateNavbar,
  deleteNavbar,
} = require("../controller/navbarController");

// =====================================================
// PUBLIC
// =====================================================

// GET ACTIVE NAVBAR
router.get("/all", getNavbar);

// =====================================================
// ADMIN
// =====================================================

// GET ALL NAVBAR
router.get("/admin/all", getAllNavbar);

// CREATE
router.post("/create", createNavbar);

// UPDATE
router.put("/update/:id", updateNavbar);

// DELETE
router.delete("/delete/:id", deleteNavbar);

module.exports = router;
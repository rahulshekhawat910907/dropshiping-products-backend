const router = require("express").Router();

const {
  createCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categorycontroller");

const {
  admin,
  protect,
} = require("../middleware/auth");

// =========================
// CREATE CATEGORY
// =========================
router.post(
  "/create",
  protect,
  admin,
  createCategory
);

// =========================
// GET ALL CATEGORY
// =========================
router.get(
  "/all",
  getAllCategory
);

// =========================
// GET SINGLE CATEGORY
// =========================
router.get(
  "/single/:id",
  getSingleCategory
);

// =========================
// UPDATE CATEGORY
// =========================
router.put(
  "/update/:id",
  protect,
  admin,
  updateCategory
);

// =========================
// DELETE CATEGORY
// =========================
router.delete(
  "/delete/:id",
  protect,
  admin,
  deleteCategory
);

module.exports = router;
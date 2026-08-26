const express = require("express");

const {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} = require(
  "../controller/supplierController"
);

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const adminMiddleware =
  require(
    "../middleware/adminMiddleware"
  );

const router = express.Router();

// ==========================================
// CREATE
// ==========================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createSupplier
);

// ==========================================
// GET ALL
// ==========================================

router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllSuppliers
);

// ==========================================
// GET SINGLE
// ==========================================

router.get(
  "/single/:id",
  authMiddleware,
  adminMiddleware,
  getSingleSupplier
);

// ==========================================
// UPDATE
// ==========================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateSupplier
);

// ==========================================
// DELETE
// ==========================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteSupplier
);

// ==========================================
// TOGGLE
// ==========================================

router.put(
  "/toggle/:id",
  authMiddleware,
  adminMiddleware,
  toggleSupplierStatus
);

module.exports = router;
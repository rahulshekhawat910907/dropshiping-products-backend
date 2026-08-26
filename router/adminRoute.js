const express = require("express");

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  changeUserRole,
  deleteUser,
  getUserStatistics,
} = require("../controller/adminController");

const router = express.Router();

// ==========================================
// USER MANAGEMENT
// ==========================================

// Get all users
router.get("/users", getAllUsers);

// User statistics
router.get("/users/statistics", getUserStatistics);

// Get single user
router.get("/users/:id", getSingleUser);

// Update user
router.put("/users/:id", updateUser);

// Change user role
router.patch("/users/:id/role", changeUserRole);

// Delete user
router.delete("/users/:id", deleteUser);

module.exports = router;
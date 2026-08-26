const express = require("express");

const {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUserRole,
} = require("../controller/userController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================================
// AUTH
// =====================================================

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

// =====================================================
// USER PROFILE
// =====================================================

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/editprofile",
  authMiddleware,
  updateProfile
);

// =====================================================
// ADMIN USERS
// =====================================================

// GET ALL USERS
router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

// GET SINGLE USER
router.get(
  "/single/:id",
  authMiddleware,
  adminMiddleware,
  getSingleUser
);

// DELETE USER
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

// UPDATE ROLE
router.put(
  "/role/:id",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);

module.exports = router;
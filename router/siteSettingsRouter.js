const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudnary");

const {
  getSettings,
  updateSiteName,
  updateAppearance,
  uploadLogo,
  deleteLogo,
} = require("../controller/siteSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "logo"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename =
      "logo-" +
      Date.now() +
      extension;

    cb(null, filename);
  },
});

const cloudinaryConfig = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].map((value) => value?.trim());

const logoStorage = cloudinaryConfig.every(Boolean) && !cloudinaryConfig.includes("rahulsingh")
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "ecommerce/logo",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
      },
    })
  : storage;

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP and SVG images are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage: logoStorage,
  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// =====================================================
// ROUTES
// =====================================================

// GET SETTINGS
router.get(
  "/",
  getSettings
);

// GET SETTINGS
router.get(
  "/all",
  getSettings
);

// UPDATE SITE NAME
router.put(
  "/site-name",
  authMiddleware,
  adminMiddleware,
  updateSiteName
);

router.put(
  "/appearance",
  authMiddleware,
  adminMiddleware,
  updateAppearance
);

// UPLOAD LOGO
router.post(
  "/logo",
  authMiddleware,
  adminMiddleware,
  upload.single("logo"),
  uploadLogo
);

// DELETE LOGO
router.delete(
  "/logo",
  authMiddleware,
  adminMiddleware,
  deleteLogo
);

module.exports = router;
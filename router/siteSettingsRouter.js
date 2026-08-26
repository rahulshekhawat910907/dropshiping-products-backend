const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  storage,
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
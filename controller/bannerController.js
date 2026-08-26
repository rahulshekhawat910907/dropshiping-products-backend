const Banner = require("../models/Banner");

// ======================================
// GET ACTIVE BANNERS
// ======================================

const getBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,

      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    }).sort({
      order: 1,
    });

    res.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get banners",
    });
  }
};

// ======================================
// GET ALL BANNERS FOR ADMIN
// ======================================

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({
      order: 1,
    });

    res.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get banners",
    });
  }
};

// ======================================
// CREATE BANNER
// ======================================

const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      desktopImage,
      mobileImage,
      buttonText,
      buttonUrl,
      position,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (!title || !desktopImage) {
      return res.status(400).json({
        success: false,
        message: "Title and desktop image are required",
      });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      desktopImage,
      mobileImage: mobileImage || "",
      buttonText: buttonText || "",
      buttonUrl: buttonUrl || "",
      position: position || "left",
      order: order || 0,
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to create banner",
    });
  }
};

// ======================================
// UPDATE BANNER
// ======================================

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const {
      title,
      subtitle,
      desktopImage,
      mobileImage,
      buttonText,
      buttonUrl,
      position,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (title !== undefined) {
      banner.title = title;
    }

    if (subtitle !== undefined) {
      banner.subtitle = subtitle;
    }

    if (desktopImage !== undefined) {
      banner.desktopImage = desktopImage;
    }

    if (mobileImage !== undefined) {
      banner.mobileImage = mobileImage;
    }

    if (buttonText !== undefined) {
      banner.buttonText = buttonText;
    }

    if (buttonUrl !== undefined) {
      banner.buttonUrl = buttonUrl;
    }

    if (position !== undefined) {
      banner.position = position;
    }

    if (order !== undefined) {
      banner.order = order;
    }

    if (isActive !== undefined) {
      banner.isActive = isActive;
    }

    if (startDate !== undefined) {
      banner.startDate = startDate || null;
    }

    if (endDate !== undefined) {
      banner.endDate = endDate || null;
    }

    await banner.save();

    res.json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update banner",
    });
  }
};

// ======================================
// DELETE BANNER
// ======================================

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
    });
  }
};

module.exports = {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
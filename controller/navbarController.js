const mongoose = require("mongoose");
const Navbar = require("../models/Navbar");

// =====================================================
// GET ACTIVE NAVBAR - PUBLIC
// GET /api/navbar/all
// =====================================================

const getNavbar = async (req, res) => {
  try {
    const navbar = await Navbar.find({
      isActive: true,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      count: navbar.length,
      navbar,
    });
  } catch (error) {
    console.error("GET NAVBAR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get navbar",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL NAVBAR - ADMIN
// GET /api/navbar/admin/all
// =====================================================

const getAllNavbar = async (req, res) => {
  try {
    const navbar = await Navbar.find().sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      count: navbar.length,
      navbar,
    });
  } catch (error) {
    console.error("GET ALL NAVBAR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get navbar",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE NAVBAR
// POST /api/navbar/create
// =====================================================

const createNavbar = async (req, res) => {
  try {
    const {
      title,
      url,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!url || !String(url).trim()) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // -----------------------------
    // CREATE
    // -----------------------------

    const navbar = await Navbar.create({
      title: String(title).trim(),

      url: String(url).trim(),

      icon: icon
        ? String(icon).trim()
        : "",

      order:
        order !== undefined &&
        order !== null &&
        order !== ""
          ? Number(order)
          : 0,

      isActive:
        isActive === undefined
          ? true
          : isActive === true ||
            isActive === "true",

      openInNewTab:
        openInNewTab === undefined
          ? false
          : openInNewTab === true ||
            openInNewTab === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Navbar item created successfully",
      navbar,
    });
  } catch (error) {
    console.error("CREATE NAVBAR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create navbar item",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE NAVBAR
// PUT /api/navbar/update/:id
// =====================================================

const updateNavbar = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------
    // ID VALIDATION
    // -----------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid navbar ID",
      });
    }

    // -----------------------------
    // FIND
    // -----------------------------

    const navbar = await Navbar.findById(id);

    if (!navbar) {
      return res.status(404).json({
        success: false,
        message: "Navbar item not found",
      });
    }

    const {
      title,
      url,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    // -----------------------------
    // UPDATE TITLE
    // -----------------------------

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      navbar.title = String(title).trim();
    }

    // -----------------------------
    // UPDATE URL
    // -----------------------------

    if (url !== undefined) {
      if (!String(url).trim()) {
        return res.status(400).json({
          success: false,
          message: "URL cannot be empty",
        });
      }

      navbar.url = String(url).trim();
    }

    // -----------------------------
    // UPDATE ICON
    // -----------------------------

    if (icon !== undefined) {
      navbar.icon = String(icon).trim();
    }

    // -----------------------------
    // UPDATE ORDER
    // -----------------------------

    if (order !== undefined) {
      const parsedOrder = Number(order);

      navbar.order = Number.isNaN(parsedOrder)
        ? 0
        : parsedOrder;
    }

    // -----------------------------
    // UPDATE ACTIVE
    // -----------------------------

    if (isActive !== undefined) {
      navbar.isActive =
        isActive === true ||
        isActive === "true";
    }

    // -----------------------------
    // UPDATE NEW TAB
    // -----------------------------

    if (openInNewTab !== undefined) {
      navbar.openInNewTab =
        openInNewTab === true ||
        openInNewTab === "true";
    }

    await navbar.save();

    return res.status(200).json({
      success: true,
      message: "Navbar item updated successfully",
      navbar,
    });
  } catch (error) {
    console.error("UPDATE NAVBAR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update navbar item",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE NAVBAR
// DELETE /api/navbar/delete/:id
// =====================================================

const deleteNavbar = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------
    // ID VALIDATION
    // -----------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid navbar ID",
      });
    }

    // -----------------------------
    // DELETE
    // -----------------------------

    const navbar =
      await Navbar.findByIdAndDelete(id);

    if (!navbar) {
      return res.status(404).json({
        success: false,
        message: "Navbar item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Navbar item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NAVBAR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete navbar item",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getNavbar,
  getAllNavbar,
  createNavbar,
  updateNavbar,
  deleteNavbar,
};
const mongoose = require("mongoose");
const Menu = require("../models/Menu");

// ==========================================
// GET PUBLIC MENU
// ==========================================

const getMenu = async (req, res) => {
  try {
    const menus = await Menu.find({
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    console.error("GET MENU ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get menus",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL MENU - ADMIN
// ==========================================

const getAllMenu = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("parent", "title")
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    console.error("GET ALL MENU ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get all menus",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE MENU - ADMIN
// ==========================================

const createMenu = async (req, res) => {
  try {
    console.log("CREATE MENU BODY:", req.body);

    const {
      title,
      url,
      type,
      parent,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    // ==============================
    // TITLE
    // ==============================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Menu title is required",
      });
    }

    // ==============================
    // TYPE
    // ==============================

    if (
      type &&
      !["link", "dropdown"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu type",
      });
    }

    // ==============================
    // PARENT VALIDATION
    // ==============================

    let parentId = null;

    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent menu ID",
        });
      }

      const parentMenu = await Menu.findById(parent);

      if (!parentMenu) {
        return res.status(400).json({
          success: false,
          message: "Parent menu not found",
        });
      }

      parentId = parent;
    }

    // ==============================
    // CREATE
    // ==============================

    const menu = await Menu.create({
      title: title.trim(),

      url:
        url && url.trim()
          ? url.trim()
          : "#",

      type: type || "link",

      parent: parentId,

      icon:
        icon && icon.trim()
          ? icon.trim()
          : "",

      order:
        order !== undefined
          ? Number(order) || 0
          : 0,

      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,

      openInNewTab:
        typeof openInNewTab === "boolean"
          ? openInNewTab
          : false,
    });

    res.status(201).json({
      success: true,
      message: "Menu created successfully",
      data: menu,
    });
  } catch (error) {
    console.error("CREATE MENU ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create menu",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE MENU - ADMIN
// ==========================================

const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu ID",
      });
    }

    const {
      title,
      url,
      type,
      parent,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    // ==============================
    // TITLE
    // ==============================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Menu title is required",
      });
    }

    // ==============================
    // TYPE
    // ==============================

    if (
      type &&
      !["link", "dropdown"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu type",
      });
    }

    // ==============================
    // PARENT
    // ==============================

    let parentId = null;

    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent menu ID",
        });
      }

      if (parent === id) {
        return res.status(400).json({
          success: false,
          message: "Menu cannot be its own parent",
        });
      }

      const parentMenu = await Menu.findById(parent);

      if (!parentMenu) {
        return res.status(400).json({
          success: false,
          message: "Parent menu not found",
        });
      }

      parentId = parent;
    }

    // ==============================
    // UPDATE
    // ==============================

    const menu = await Menu.findByIdAndUpdate(
      id,
      {
        title: title.trim(),

        url:
          url && url.trim()
            ? url.trim()
            : "#",

        type: type || "link",

        parent: parentId,

        icon:
          icon && icon.trim()
            ? icon.trim()
            : "",

        order:
          order !== undefined
            ? Number(order) || 0
            : 0,

        isActive:
          typeof isActive === "boolean"
            ? isActive
            : true,

        openInNewTab:
          typeof openInNewTab === "boolean"
            ? openInNewTab
            : false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      data: menu,
    });
  } catch (error) {
    console.error("UPDATE MENU ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update menu",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE MENU - ADMIN
// ==========================================

const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu ID",
      });
    }

    // Delete children first
    await Menu.updateMany(
      { parent: id },
      { $set: { parent: null } }
    );

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MENU ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete menu",
      error: error.message,
    });
  }
};

module.exports = {
  getMenu,
  getAllMenu,
  createMenu,
  updateMenu,
  deleteMenu,
};
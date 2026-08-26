const Category = require("../models/category");

// ======================================
// CREATE CATEGORY
// ======================================

const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parentCategory,
      order,
      isActive,
      featured,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const existingCategory = await Category.findOne({
      slug: finalSlug,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    if (parentCategory) {
      const parent = await Category.findById(parentCategory);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    const category = await Category.create({
      name,
      slug: finalSlug,
      description: description || "",
      image: image || "",
      parentCategory: parentCategory || null,
      order: order || 0,
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,
      featured:
        typeof featured === "boolean"
          ? featured
          : false,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// ======================================
// GET ACTIVE CATEGORIES
// ======================================

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .populate("parentCategory", "name slug")
      .sort({
        order: 1,
        name: 1,
      });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get categories",
    });
  }
};

// ======================================
// GET ALL CATEGORIES ADMIN
// ======================================

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentCategory", "name slug")
      .sort({
        order: 1,
        name: 1,
      });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get categories",
    });
  }
};

// ======================================
// GET SINGLE CATEGORY
// ======================================

const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate(
      "parentCategory",
      "name slug"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get category",
    });
  }
};

// ======================================
// GET CATEGORY BY SLUG
// ======================================

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug,
      isActive: true,
    }).populate("parentCategory", "name slug");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get category",
    });
  }
};

// ======================================
// UPDATE CATEGORY
// ======================================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      parentCategory,
      order,
      isActive,
      featured,
    } = req.body;

    if (name !== undefined) {
      category.name = name;
    }

    if (slug !== undefined) {
      const existing = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Slug already exists",
        });
      }

      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (parentCategory !== undefined) {
      if (parentCategory === id) {
        return res.status(400).json({
          success: false,
          message:
            "Category cannot be its own parent",
        });
      }

      if (parentCategory) {
        const parent = await Category.findById(
          parentCategory
        );

        if (!parent) {
          return res.status(404).json({
            success: false,
            message: "Parent category not found",
          });
        }
      }

      category.parentCategory =
        parentCategory || null;
    }

    if (order !== undefined) {
      category.order = order;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    if (featured !== undefined) {
      category.featured = featured;
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// ======================================
// DELETE CATEGORY
// ======================================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // पहले child categories हटाओ
    await Category.deleteMany({
      parentCategory: category._id,
    });

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getAllCategories,
  getSingleCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
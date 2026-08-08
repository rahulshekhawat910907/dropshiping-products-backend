const Product = require("../models/product");
const Category = require("../models/category");

// Create Product
const productCreate = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      price,
      stock,
      discountprice,
      image,
    } = req.body;

    if (
      !name ||
      !description ||
      !brand ||
      !category ||
      !image ||
      price == null ||
      stock == null
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check Category
    const existCategory = await Category.findById(category);

    if (!existCategory) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      price,
      stock,
      discountprice,
      image,
    });

    return res.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (keyword && keyword.trim() !== "") {
      const words = keyword.trim().split(" ").filter(Boolean);

      filter.$or = words.map((word) => ({
        name: { $regex: word, $options: "i" },
      }));
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Product
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      brand,
      category,
      price,
      discountPrice,
      stock,
      image,
    } = req.body;

    const existProduct = await Product.findById(id);

    if (!existProduct) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    
    if (category) {
      const existCategory = await Category.findById(category);

      if (!existCategory) {
        return res.json({
          success: false,
          message: "Category not found",
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        brand,
        category,
        price,
        discountPrice,
        stock,
        image,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("category");

    return res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  productCreate,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
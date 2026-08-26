const SiteSettings = require("../models/SiteSettings");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Address = require("../models/Address");

// ======================================================
// GET WHATSAPP SETTINGS
// ======================================================

const getWhatsappSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        whatsappNumber: process.env.WHATSAPP_NUMBER || "",
        whatsappMessage:
          "Hello, I want to inquire about this product.",
        whatsappEnabled: true,
      });
    }

    if (!settings.whatsappNumber && process.env.WHATSAPP_NUMBER) {
      settings.whatsappNumber = String(process.env.WHATSAPP_NUMBER).replace(/\D/g, "");
      await settings.save();
    }

    const resolvedNumber =
      settings.whatsappNumber ||
      process.env.WHATSAPP_NUMBER ||
      "";

    const resolvedMessage =
      settings.whatsappMessage ||
      "Hello, I want to inquire about this product.";

    const enabled =
      settings.whatsappEnabled !== false;

    res.status(200).json({
      success: true,
      number: resolvedNumber,
      whatsappNumber: resolvedNumber,
      whatsappMessage: resolvedMessage,
      whatsappEnabled: enabled,
      enabled,
      whatsapp: {
        number: resolvedNumber,
        message: resolvedMessage,
        enabled,
      },
    });
  } catch (error) {
    console.error(
      "Get WhatsApp Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get WhatsApp settings",
    });
  }
};

// ======================================================
// UPDATE WHATSAPP SETTINGS
// ADMIN ONLY
// ======================================================

const updateWhatsappSettings = async (
  req,
  res
) => {
  try {
    const {
      whatsappNumber,
      whatsappMessage,
      whatsappEnabled,
    } = req.body;

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        whatsappNumber:
          process.env.WHATSAPP_NUMBER || "",
        whatsappMessage:
          "Hello, I want to inquire about this product.",
        whatsappEnabled: true,
      });
    }

    // ==========================================
    // WHATSAPP NUMBER
    // ==========================================

    if (whatsappNumber !== undefined) {
      const cleanNumber = String(
        whatsappNumber
      ).replace(/\D/g, "");

      if (!cleanNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Valid WhatsApp number is required",
        });
      }

      settings.whatsappNumber =
        cleanNumber;
    }

    if (!settings.whatsappNumber && process.env.WHATSAPP_NUMBER) {
      settings.whatsappNumber = String(
        process.env.WHATSAPP_NUMBER
      ).replace(/\D/g, "");
    }

    // ==========================================
    // DEFAULT MESSAGE
    // ==========================================

    if (whatsappMessage !== undefined) {
      settings.whatsappMessage =
        String(whatsappMessage).trim();
    }

    // ==========================================
    // ENABLE / DISABLE
    // ==========================================

    if (whatsappEnabled !== undefined) {
      settings.whatsappEnabled =
        whatsappEnabled === true ||
        whatsappEnabled === "true";
    }

    await settings.save();

    const responseNumber =
      settings.whatsappNumber ||
      process.env.WHATSAPP_NUMBER ||
      "";

    const responseMessage =
      settings.whatsappMessage ||
      "Hello, I want to inquire about this product.";

    const enabled =
      settings.whatsappEnabled !== false;

    res.status(200).json({
      success: true,

      message:
        "WhatsApp settings updated successfully",

      number: responseNumber,
      whatsappNumber: responseNumber,
      whatsappMessage: responseMessage,
      whatsappEnabled: enabled,
      enabled,

      whatsapp: {
        number: responseNumber,
        message: responseMessage,
        enabled,
      },
    });
  } catch (error) {
    console.error(
      "Update WhatsApp Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update WhatsApp settings",
    });
  }
};

// ======================================================
// CREATE SINGLE PRODUCT WHATSAPP INQUIRY
// ======================================================

const createProductInquiry = async (
  req,
  res
) => {
  try {
    const {
      productId,
      quantity = 1,
    } = req.body;

    // ==========================================
    // PRODUCT ID CHECK
    // ==========================================

    if (!productId) {
      return res.status(400).json({
        success: false,
        message:
          "Product ID is required",
      });
    }

    // ==========================================
    // GET PRODUCT
    // ==========================================

    const product =
      await Product.findById(
        productId
      ).populate(
        "category",
        "name"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    // ==========================================
    // GET SETTINGS
    // ==========================================

    const settings =
      await SiteSettings.findOne();

    const configuredNumber = settings?.whatsappNumber || "";

    if (
      !settings ||
      !configuredNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "WhatsApp number is not configured",
      });
    }

    // ==========================================
    // CHECK WHATSAPP ENABLED
    // ==========================================

    if (
      settings.whatsappEnabled === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "WhatsApp inquiry is currently disabled",
      });
    }

    // ==========================================
    // QUANTITY
    // ==========================================

    const qty = Math.max(
      Number(quantity) || 1,
      1
    );

    // ==========================================
    // CHECK STOCK
    // ==========================================

    if (
      product.stock !== undefined &&
      product.stock < qty
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Requested quantity is not available",
      });
    }

    // ==========================================
    // SELLING PRICE
    // ==========================================

    const sellingPrice =
      product.salePrice !== null &&
      product.salePrice !== undefined
        ? product.salePrice
        : product.price;

    const total =
      sellingPrice * qty;

    // ==========================================
    // WHATSAPP MESSAGE
    // ==========================================

    const message = [
      settings.whatsappMessage ||
        "Hello, I want to inquire about this product.",

      "",

      "🛍️ PRODUCT INQUIRY",

      "",

      `Product: ${product.name}`,

      `Category: ${
        product.category?.name ||
        "N/A"
      }`,

      `Quantity: ${qty}`,

      `Price: ₹${sellingPrice}`,

      `Total: ₹${total}`,

      `Product ID: ${product._id}`,

      "",

      "Please confirm product availability and delivery details.",
    ].join("\n");

    // ==========================================
    // WHATSAPP URL
    // ==========================================

    const whatsappUrl =
      `https://wa.me/${configuredNumber}` +
      `?text=${encodeURIComponent(
        message
      )}`;

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      message:
        "WhatsApp inquiry created successfully",

      whatsappUrl,

      inquiry: {
        productId:
          product._id,

        productName:
          product.name,

        quantity: qty,

        price:
          sellingPrice,

        total,
      },
    });
  } catch (error) {
    console.error(
      "Product WhatsApp Inquiry Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create WhatsApp inquiry",
    });
  }
};

// ======================================================
// CREATE CART WHATSAPP INQUIRY
// WITH CUSTOMER ADDRESS
// ======================================================

const createCartInquiry = async (
  req,
  res
) => {
  try {
    // ==========================================
    // CHECK USER
    // ==========================================

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Please login first",
      });
    }

    // ==========================================
    // GET CART
    // ==========================================

    const cart =
      await Cart.findOne({
        user: req.user._id,
      }).populate({
        path: "items.product",
        select:
          "name price salePrice stock sku",
      });

    // ==========================================
    // EMPTY CART CHECK
    // ==========================================

    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cart is empty",
      });
    }

    // ==========================================
    // GET DEFAULT ADDRESS
    // ==========================================

    const address =
      await Address.findOne({
        user: req.user._id,
        isDefault: true,
      });

    if (!address) {
      return res.status(400).json({
        success: false,
        message:
          "Please add a default address before sending inquiry",
      });
    }

    // ==========================================
    // GET WHATSAPP SETTINGS
    // ==========================================

    const settings =
      await SiteSettings.findOne();

    const configuredNumber = settings?.whatsappNumber || "";

    if (
      !settings ||
      !configuredNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "WhatsApp number is not configured",
      });
    }

    // ==========================================
    // CHECK WHATSAPP ENABLED
    // ==========================================

    if (
      settings.whatsappEnabled === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "WhatsApp inquiry is currently disabled",
      });
    }

    // ==========================================
    // PRODUCTS
    // ==========================================

    let total = 0;

    const productLines =
      cart.items.map(
        (item, index) => {
          const product =
            item.product;

          // अगर product delete हो चुका हो
          if (!product) {
            return null;
          }

          const price =
            product.salePrice !== null &&
            product.salePrice !== undefined
              ? product.salePrice
              : product.price;

          const quantity =
            Number(item.quantity) || 1;

          const itemTotal =
            price * quantity;

          total += itemTotal;

          return [
            `${index + 1}. ${product.name}`,

            `   Qty: ${quantity}`,

            `   Price: ₹${price}`,

            `   Total: ₹${itemTotal}`,

            `   SKU: ${
              product.sku || "N/A"
            }`,
          ].join("\n");
        }
      ).filter(Boolean);

    // ==========================================
    // CHECK VALID PRODUCTS
    // ==========================================

    if (
      productLines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid products found in cart",
      });
    }

    // ==========================================
    // CUSTOMER DETAILS
    // ==========================================

    const customerDetails = [
      "👤 CUSTOMER DETAILS",

      "",

      `Name: ${address.name}`,

      `Phone: ${address.phone}`,
    ].join("\n");

    // ==========================================
    // ADDRESS DETAILS
    // ==========================================

    const addressDetails = [
      "📍 DELIVERY ADDRESS",

      "",

      address.address,

      `Landmark: ${
        address.landmark ||
        "N/A"
      }`,

      `City: ${address.city}`,

      `State: ${address.state}`,

      `Pincode: ${address.pincode}`,
    ].join("\n");

    // ==========================================
    // FINAL WHATSAPP MESSAGE
    // ==========================================

    const message = [
      settings.whatsappMessage ||
        "Hello, I want to inquire about these products.",

      "",

      "🛒 CART INQUIRY",

      "",

      productLines.join(
        "\n\n"
      ),

      "",

      `💰 GRAND TOTAL: ₹${total}`,

      "",

      customerDetails,

      "",

      addressDetails,

      "",

      "Please confirm product availability, delivery charges and final details.",
    ].join("\n");

    // ==========================================
    // WHATSAPP URL
    // ==========================================

    const whatsappUrl =
      `https://wa.me/${configuredNumber}` +
      `?text=${encodeURIComponent(
        message
      )}`;

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      message:
        "Cart WhatsApp inquiry created successfully",

      whatsappUrl,

      total,

      customer: {
        name: address.name,
        phone: address.phone,
      },

      address: {
        address:
          address.address,

        landmark:
          address.landmark,

        city: address.city,

        state: address.state,

        pincode:
          address.pincode,
      },

      products:
        cart.items
          .filter(
            (item) =>
              item.product
          )
          .map((item) => {
            const product =
              item.product;

            const price =
              product.salePrice !==
                null &&
              product.salePrice !==
                undefined
                ? product.salePrice
                : product.price;

            return {
              productId:
                product._id,

              name:
                product.name,

              quantity:
                item.quantity,

              price,

              total:
                price *
                item.quantity,
            };
          }),
    });
  } catch (error) {
    console.error(
      "Cart WhatsApp Inquiry Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create cart inquiry",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getWhatsappSettings,
  updateWhatsappSettings,
  createProductInquiry,
  createCartInquiry,
};
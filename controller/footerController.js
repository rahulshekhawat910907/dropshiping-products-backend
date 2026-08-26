const Footer = require("../models/Footer");

// ==========================================
// GET FOOTER
// GET /api/footer
// ==========================================

const getFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();

    // Agar footer database me nahi hai
    if (!footer) {
      footer = await Footer.create({
        companyName: "My Ecommerce",
        description: "Your trusted online shopping destination.",
        phone: "",
        email: "",
        address: "",
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        copyright: "© 2026 My Ecommerce. All rights reserved.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Footer fetched successfully",
      footer,
    });
  } catch (error) {
    console.error("GET FOOTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get footer",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE FOOTER
// PUT /api/footer/update
// ==========================================

const updateFooter = async (req, res) => {
  try {
    const {
      companyName,
      description,
      phone,
      email,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
      copyright,
    } = req.body;

    let footer = await Footer.findOne();

    // Agar footer nahi hai to create karo
    if (!footer) {
      footer = new Footer();
    }

    footer.companyName = companyName ?? footer.companyName;
    footer.description = description ?? footer.description;
    footer.phone = phone ?? footer.phone;
    footer.email = email ?? footer.email;
    footer.address = address ?? footer.address;

    footer.facebook = facebook ?? footer.facebook;
    footer.instagram = instagram ?? footer.instagram;
    footer.twitter = twitter ?? footer.twitter;
    footer.youtube = youtube ?? footer.youtube;

    footer.copyright = copyright ?? footer.copyright;

    await footer.save();

    res.status(200).json({
      success: true,
      message: "Footer updated successfully",
      footer,
    });
  } catch (error) {
    console.error("UPDATE FOOTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update footer",
      error: error.message,
    });
  }
};

module.exports = {
  getFooter,
  updateFooter,
};
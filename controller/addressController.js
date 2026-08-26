const Address = require("../models/Address");

// ======================================
// CREATE ADDRESS
// ======================================

const createAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone, address, city, state and pincode are required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must be 10 digits",
      });
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message:
          "Pincode must be 6 digits",
      });
    }

    // अगर default address बनाया जा रहा है
    // तो पुराने default हटाओ

    if (isDefault) {
      await Address.updateMany(
        {
          user: req.user._id,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    const addressData =
      await Address.create({
        user: req.user._id,
        name,
        phone,
        address,
        landmark: landmark || "",
        city,
        state,
        pincode,
        isDefault: Boolean(isDefault),
      });

    res.status(201).json({
      success: true,
      message:
        "Address created successfully",
      address: addressData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to create address",
    });
  }
};

// ======================================
// GET MY ADDRESSES
// ======================================

const getMyAddresses = async (req, res) => {
  try {
    const addresses =
      await Address.find({
        user: req.user._id,
      }).sort({
        isDefault: -1,
        createdAt: -1,
      });

    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get addresses",
    });
  }
};

// ======================================
// GET SINGLE ADDRESS
// ======================================

const getSingleAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address =
      await Address.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      address,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get address",
    });
  }
};

// ======================================
// UPDATE ADDRESS
// ======================================

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address =
      await Address.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      name,
      phone,
      address: addressText,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (
      phone !== undefined &&
      !/^[0-9]{10}$/.test(phone)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must be 10 digits",
      });
    }

    if (
      pincode !== undefined &&
      !/^[0-9]{6}$/.test(pincode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pincode must be 6 digits",
      });
    }

    if (isDefault === true) {
      await Address.updateMany(
        {
          user: req.user._id,
          _id: {
            $ne: id,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    if (name !== undefined) {
      address.name = name;
    }

    if (phone !== undefined) {
      address.phone = phone;
    }

    if (addressText !== undefined) {
      address.address = addressText;
    }

    if (landmark !== undefined) {
      address.landmark = landmark;
    }

    if (city !== undefined) {
      address.city = city;
    }

    if (state !== undefined) {
      address.state = state;
    }

    if (pincode !== undefined) {
      address.pincode = pincode;
    }

    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.json({
      success: true,
      message:
        "Address updated successfully",
      address,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// ======================================
// DELETE ADDRESS
// ======================================

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address =
      await Address.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message:
        "Address deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

// ======================================
// SET DEFAULT ADDRESS
// ======================================

const setDefaultAddress = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const address =
      await Address.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.updateMany(
      {
        user: req.user._id,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    address.isDefault = true;

    await address.save();

    res.json({
      success: true,
      message:
        "Default address updated",
      address,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to set default address",
    });
  }
};

module.exports = {
  createAddress,
  getMyAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
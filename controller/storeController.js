const mongoose = require("mongoose");

const Store = require("../models/Store");
const StoreProduct = require("../models/StoreProduct");
const Product = require("../models/product");

// Remove trailing slash from frontend URL
const frontendUrl = () => {
return (
process.env.FRONTEND_URL ||
"https://frontend-msf2.vercel.app"
).replace(/\/$/, "");
};

// Convert text into URL-friendly slug
const slugify = (value) => {
return String(value || "")
.trim()
.toLowerCase()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-+|-+$/g, "");
};

// Get logged-in user ID from auth middleware
const userId = (req) => {
return req.user?._id || req.user?.id;
};

// Find current user's store
const findOwnStore = async (req) => {
const id = userId(req);

if (!id) return null;

return await Store.findOne({
user: id,
});
};

/* =========================================================
CREATE STORE
========================================================= */

const createStore = async (req, res) => {
try {
const { username, storeName, storeSlug } = req.body;


const currentUserId = userId(req);

if (!currentUserId) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized user",
  });
}

if (!username?.trim()) {
  return res.status(400).json({
    success: false,
    message: "Username is required",
  });
}

if (!storeName?.trim()) {
  return res.status(400).json({
    success: false,
    message: "Store name is required",
  });
}

const slug = slugify(storeSlug);

if (!slug) {
  return res.status(400).json({
    success: false,
    message: "Valid store slug is required",
  });
}

// FIRST CHECK:
// Does this logged-in user already have a store?
const existingStore = await Store.findOne({
  user: currentUserId,
});

if (existingStore) {
  return res.status(200).json({
    success: true,
    existing: true,
    message: "Your store already exists",
    store: existingStore,
  });
}

// SECOND CHECK:
// Is this slug already used by another store?
const slugExists = await Store.findOne({
  storeSlug: slug,
});

if (slugExists) {
  return res.status(409).json({
    success: false,
    code: "SLUG_TAKEN",
    message: "This store URL is already in use. Please choose another slug.",
  });
}

// CREATE STORE
const store = await Store.create({
  user: currentUserId,
  username: username.trim(),
  storeName: storeName.trim(),
  storeSlug: slug,
  storeUrl: `${frontendUrl()}/store/${slug}`,
});

return res.status(201).json({
  success: true,
  existing: false,
  message: "Store created successfully",
  store,
});


} catch (error) {
console.error("CREATE STORE ERROR:", error);


// MongoDB duplicate key error
if (error.code === 11000) {
  try {
    const existingStore = await findOwnStore(req);

    // If parallel requests tried creating the same user's store,
    // return the existing store instead of treating it as a failure.
    if (existingStore) {
      return res.status(200).json({
        success: true,
        existing: true,
        message: "Your store already exists",
        store: existingStore,
      });
    }

    const duplicateField =
      Object.keys(error.keyPattern || {})[0];

    if (duplicateField === "storeSlug") {
      return res.status(409).json({
        success: false,
        code: "SLUG_TAKEN",
        message:
          "This store URL is already in use. Please choose another slug.",
      });
    }

    console.error(
      "UNEXPECTED STORE DUPLICATE KEY:",
      error.keyPattern,
      error.keyValue
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create store because of a database constraint",
    });

  } catch (findError) {
    console.error("DUPLICATE STORE CHECK ERROR:", findError);

    return res.status(409).json({
      success: false,
      message: "Store already exists",
    });
  }
}

return res.status(500).json({
  success: false,
  message: "Unable to create store",
});


}
};

/* =========================================================
GET MY STORE
========================================================= */

const getMyStore = async (req, res) => {
try {
const store = await findOwnStore(req);


return res.status(200).json({
  success: true,
  store: store || null,
});


} catch (error) {
console.error("GET MY STORE ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to fetch store",
});


}
};

/* =========================================================
UPDATE STORE
========================================================= */

const updateStore = async (req, res) => {
try {
const store = await findOwnStore(req);


if (!store) {
  return res.status(404).json({
    success: false,
    message: "Create a store first",
  });
}

const { username, storeName, storeSlug } = req.body;

if (username !== undefined) {
  const value = String(username).trim();

  if (!value) {
    return res.status(400).json({
      success: false,
      message: "Username cannot be empty",
    });
  }

  store.username = value;
}

if (storeName !== undefined) {
  const value = String(storeName).trim();

  if (!value) {
    return res.status(400).json({
      success: false,
      message: "Store name cannot be empty",
    });
  }

  store.storeName = value;
}

if (storeSlug !== undefined) {
  const slug = slugify(storeSlug);

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Valid store slug is required",
    });
  }

  const conflict = await Store.findOne({
    storeSlug: slug,
    _id: {
      $ne: store._id,
    },
  });

  if (conflict) {
    return res.status(409).json({
      success: false,
      code: "SLUG_TAKEN",
      message: "Store slug is already in use",
    });
  }

  store.storeSlug = slug;
  store.storeUrl = `${frontendUrl()}/store/${slug}`;
}

await store.save();

return res.status(200).json({
  success: true,
  message: "Store updated successfully",
  store,
});


} catch (error) {
console.error("UPDATE STORE ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to update store",
});


}
};

/* =========================================================
UPDATE THEME
========================================================= */

const updateTheme = async (req, res) => {
try {
const store = await findOwnStore(req);


if (!store) {
  return res.status(404).json({
    success: false,
    message: "Store not found",
  });
}

const { theme } = req.body;

if (!["default", "modern", "dark"].includes(theme)) {
  return res.status(400).json({
    success: false,
    message: "Invalid theme",
  });
}

store.theme = theme;

await store.save();

return res.status(200).json({
  success: true,
  store,
});


} catch (error) {
console.error("UPDATE THEME ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to update theme",
});


}
};

/* =========================================================
UPDATE STORE MEDIA
========================================================= */

const updateMedia = async (req, res) => {
try {
const store = await findOwnStore(req);


if (!store) {
  return res.status(404).json({
    success: false,
    message: "Store not found",
  });
}

if (req.body.logo !== undefined) {
  store.logo = String(req.body.logo);
}

if (req.body.banner !== undefined) {
  store.banner = String(req.body.banner);
}

await store.save();

return res.status(200).json({
  success: true,
  store,
});


} catch (error) {
console.error("UPDATE MEDIA ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to update store media",
});


}
};

/* =========================================================
CHECK STORE SLUG
========================================================= */

const checkSlug = async (req, res) => {
try {
const slug = slugify(req.params.slug);


if (!slug) {
  return res.status(400).json({
    success: false,
    available: false,
    message: "Invalid slug",
  });
}

const exists = await Store.exists({
  storeSlug: slug,
});

return res.status(200).json({
  success: true,
  available: !exists,
});


} catch (error) {
console.error("CHECK SLUG ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to check slug",
});


}
};

/* =========================================================
PUBLIC STORE
========================================================= */

const publicStore = async (req, res) => {
try {
const slug = slugify(req.params.slug);


const store = await Store.findOne({
  storeSlug: slug,
  status: "active",
}).select(
  "storeName username storeSlug logo banner theme status"
);

if (!store) {
  return res.status(404).json({
    success: false,
    message: "Store not found",
  });
}

return res.status(200).json({
  success: true,
  store,
});


} catch (error) {
console.error("PUBLIC STORE ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to fetch store",
});


}
};

/* =========================================================
PUBLIC THEME
========================================================= */

const publicTheme = async (req, res) => {
try {
const slug = slugify(req.params.slug);


const store = await Store.findOne({
  storeSlug: slug,
  status: "active",
}).select("theme");

if (!store) {
  return res.status(404).json({
    success: false,
    message: "Store not found",
  });
}

return res.status(200).json({
  success: true,
  theme: store.theme,
});


} catch (error) {
console.error("PUBLIC THEME ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to fetch theme",
});


}
};

/* =========================================================
PUBLIC STORE PRODUCTS
========================================================= */

const publicProducts = async (req, res) => {
try {
const slug = slugify(req.params.slug);


const store = await Store.findOne({
  storeSlug: slug,
  status: "active",
}).select("_id");

if (!store) {
  return res.status(404).json({
    success: false,
    message: "Store not found",
  });
}

const rows = await StoreProduct.find({
  store: store._id,
  status: true,
})
  .populate({
    path: "product",
    match: {
      isActive: true,
      approvalStatus: "approved",
    },
    select:
      "name description price salePrice image images stock brand category",
  })
  .lean();

const products = rows
  .filter((row) => row.product)
  .map((row) => ({
    storeProductId: row._id,
    productId: row.product._id,
    ...row.product,
    originalPrice:
      row.product.salePrice || row.product.price,
    sellingPrice: row.sellingPrice,
  }));

return res.status(200).json({
  success: true,
  products,
});


} catch (error) {
console.error("PUBLIC PRODUCTS ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to fetch products",
});


}
};

/* =========================================================
ADD PRODUCT TO MY STORE
========================================================= */

const addProduct = async (req, res) => {
try {
const store = await findOwnStore(req);


if (!store) {
  return res.status(404).json({
    success: false,
    message: "Create a store first",
  });
}

const { productId, sellingPrice } = req.body;

if (!mongoose.Types.ObjectId.isValid(productId)) {
  return res.status(400).json({
    success: false,
    message: "Valid productId is required",
  });
}

const product = await Product.findOne({
  _id: productId,
  isActive: true,
  approvalStatus: "approved",
});

if (!product) {
  return res.status(404).json({
    success: false,
    message: "Product not found",
  });
}

const price = Number(sellingPrice);

if (!Number.isFinite(price) || price < 0) {
  return res.status(400).json({
    success: false,
    message: "Valid selling price is required",
  });
}

const row = await StoreProduct.create({
  store: store._id,
  product: product._id,
  sellingPrice: price,
});

return res.status(201).json({
  success: true,
  product: row,
});


} catch (error) {
console.error("ADD STORE PRODUCT ERROR:", error);


if (error.code === 11000) {
  return res.status(409).json({
    success: false,
    message: "Product is already in your store",
  });
}

return res.status(500).json({
  success: false,
  message: "Unable to add product",
});


}
};

/* =========================================================
GET MY STORE PRODUCTS
========================================================= */

const ownProducts = async (req, res) => {
try {
const store = await findOwnStore(req);


if (!store) {
  return res.status(200).json({
    success: true,
    products: [],
  });
}

const products = await StoreProduct.find({
  store: store._id,
})
  .populate(
    "product",
    "name price salePrice image stock"
  )
  .sort({
    createdAt: -1,
  });

return res.status(200).json({
  success: true,
  products,
});


} catch (error) {
console.error("GET OWN PRODUCTS ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Unable to fetch products",
});


}
};

/* =========================================================
UPDATE OR DELETE MY STORE PRODUCT
========================================================= */

const ownProduct = async (req, res) => {
try {
const store = await findOwnStore(req);


if (
  !store ||
  !mongoose.Types.ObjectId.isValid(
    req.params.productId
  )
) {
  return res.status(404).json({
    success: false,
    message: "Store product not found",
  });
}

const row = await StoreProduct.findOne({
  _id: req.params.productId,
  store: store._id,
});

if (!row) {
  return res.status(404).json({
    success: false,
    message: "Store product not found",
  });
}

// DELETE PRODUCT
if (req.method === "DELETE") {
  await row.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Product removed",
  });
}

// UPDATE SELLING PRICE
if (req.body.sellingPrice !== undefined) {
  const price = Number(req.body.sellingPrice);

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid selling price",
    });
  }

  row.sellingPrice = price;
}

// UPDATE STATUS
if (req.body.status !== undefined) {
  row.status = Boolean(req.body.status);
}

await row.save();

return res.status(200).json({
  success: true,
  product: row,
});


} catch (error) {
console.error("UPDATE STORE PRODUCT ERROR:", error);

return res.status(500).json({
  success: false,
  message: "Unable to update store product",
});


}
};

module.exports = {
createStore,
getMyStore,
updateStore,
updateTheme,
updateMedia,
checkSlug,
publicStore,
publicTheme,
publicProducts,
addProduct,
ownProducts,
ownProduct,
};

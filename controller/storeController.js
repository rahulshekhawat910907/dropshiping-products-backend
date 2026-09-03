const mongoose = require("mongoose");
const Store = require("../models/Store");
const StoreProduct = require("../models/StoreProduct");
const Product = require("../models/product");

const frontendUrl = () => (process.env.FRONTEND_URL || "https://frontend-msf2.vercel.app").replace(/\/$/, "");
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const userId = (req) => req.user?._id || req.user?.id;

const findOwnStore = (req) => Store.findOne({ user: userId(req) });

const createStore = async (req, res) => {
  try {
    const { username, storeName, storeSlug } = req.body;
    const slug = slugify(storeSlug);
    if (!username?.trim() || !storeName?.trim() || !slug) return res.status(400).json({ success: false, message: "Username, store name and store slug are required" });
    if (await findOwnStore(req)) return res.status(409).json({ success: false, message: "You already have a store" });
    if (await Store.exists({ storeSlug: slug })) return res.status(409).json({ success: false, message: "Store slug is already in use" });
    const store = await Store.create({ user: userId(req), username: username.trim(), storeName: storeName.trim(), storeSlug: slug, storeUrl: `${frontendUrl()}/store/${slug}` });
    return res.status(201).json({ success: true, store });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Store slug is already in use" });
    console.error("CREATE STORE ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create store" });
  }
};

const getMyStore = async (req, res) => {
  const store = await findOwnStore(req);
  return res.status(200).json({ success: true, store: store || null });
};

const updateStore = async (req, res) => {
  try {
    const store = await findOwnStore(req);
    if (!store) return res.status(404).json({ success: false, message: "Create a store first" });
    const { username, storeName, storeSlug } = req.body;
    if (username !== undefined) store.username = String(username).trim();
    if (storeName !== undefined) store.storeName = String(storeName).trim();
    if (storeSlug !== undefined) {
      const slug = slugify(storeSlug);
      if (!slug) return res.status(400).json({ success: false, message: "Store slug is required" });
      const conflict = await Store.exists({ storeSlug: slug, _id: { $ne: store._id } });
      if (conflict) return res.status(409).json({ success: false, message: "Store slug is already in use" });
      store.storeSlug = slug;
      store.storeUrl = `${frontendUrl()}/store/${slug}`;
    }
    await store.save();
    return res.json({ success: true, store });
  } catch (error) { return res.status(500).json({ success: false, message: "Unable to update store" }); }
};

const updateTheme = async (req, res) => {
  const store = await findOwnStore(req);
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });
  if (!["default", "modern", "dark"].includes(req.body.theme)) return res.status(400).json({ success: false, message: "Invalid theme" });
  store.theme = req.body.theme;
  await store.save();
  return res.json({ success: true, store });
};

const updateMedia = async (req, res) => {
  const store = await findOwnStore(req);
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });
  if (req.body.logo !== undefined) store.logo = String(req.body.logo);
  if (req.body.banner !== undefined) store.banner = String(req.body.banner);
  await store.save();
  return res.json({ success: true, store });
};

const checkSlug = async (req, res) => res.json({ success: true, available: !(await Store.exists({ storeSlug: slugify(req.params.slug) })) });

const publicStore = async (req, res) => {
  const store = await Store.findOne({ storeSlug: slugify(req.params.slug), status: "active" }).select("storeName username storeSlug logo banner theme status");
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });
  return res.json({ success: true, store });
};

const publicProducts = async (req, res) => {
  const store = await Store.findOne({ storeSlug: slugify(req.params.slug), status: "active" }).select("_id");
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });
  const rows = await StoreProduct.find({ store: store._id, status: true }).populate({ path: "product", match: { isActive: true, approvalStatus: "approved" }, select: "name description price salePrice image images stock brand category" }).lean();
  const products = rows.filter((row) => row.product).map((row) => ({ storeProductId: row._id, productId: row.product._id, ...row.product, originalPrice: row.product.salePrice || row.product.price, sellingPrice: row.sellingPrice }));
  return res.json({ success: true, products });
};

const addProduct = async (req, res) => {
  const store = await findOwnStore(req);
  const { productId, sellingPrice } = req.body;
  if (!store) return res.status(404).json({ success: false, message: "Create a store first" });
  if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ success: false, message: "Valid productId is required" });
  const product = await Product.findOne({ _id: productId, isActive: true, approvalStatus: "approved" });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  const price = Number(sellingPrice);
  if (!Number.isFinite(price) || price < 0) return res.status(400).json({ success: false, message: "Valid selling price is required" });
  try { const row = await StoreProduct.create({ store: store._id, product: product._id, sellingPrice: price }); return res.status(201).json({ success: true, product: row }); }
  catch (error) { if (error.code === 11000) return res.status(409).json({ success: false, message: "Product is already in your store" }); return res.status(500).json({ success: false, message: "Unable to add product" }); }
};

const ownProducts = async (req, res) => { const store = await findOwnStore(req); if (!store) return res.json({ success: true, products: [] }); const products = await StoreProduct.find({ store: store._id }).populate("product", "name price salePrice image stock").sort({ createdAt: -1 }); return res.json({ success: true, products }); };
const ownProduct = async (req, res) => { const store = await findOwnStore(req); if (!store || !mongoose.Types.ObjectId.isValid(req.params.productId)) return res.status(404).json({ success: false, message: "Store product not found" }); const row = await StoreProduct.findOne({ _id: req.params.productId, store: store._id }); if (!row) return res.status(404).json({ success: false, message: "Store product not found" }); if (req.method === "DELETE") { await row.deleteOne(); return res.json({ success: true, message: "Product removed" }); } if (req.body.sellingPrice !== undefined) { const price = Number(req.body.sellingPrice); if (!Number.isFinite(price) || price < 0) return res.status(400).json({ success: false, message: "Invalid selling price" }); row.sellingPrice = price; } if (req.body.status !== undefined) row.status = Boolean(req.body.status); await row.save(); return res.json({ success: true, product: row }); };

module.exports = { createStore, getMyStore, updateStore, updateTheme, updateMedia, checkSlug, publicStore, publicProducts, addProduct, ownProducts, ownProduct };
const Product = require('../models/Product');
const { clearCache } = require('../middleware/cache');

// Get all products (with filters)
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const products = await Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      service: 'product-service',
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await clearCache('products:*');
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await clearCache('products:*');
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await clearCache('products:*');
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seed sample products
exports.seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = [
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with A17 chip', price: 999, category: 'electronics', stock: 50, rating: 4.8 },
      { name: 'Samsung 4K TV', description: '55 inch 4K Smart TV with HDR', price: 699, category: 'electronics', stock: 30, rating: 4.5 },
      { name: 'Nike Air Max', description: 'Premium running shoes', price: 149, category: 'sports', stock: 100, rating: 4.6 },
      { name: 'Clean Code Book', description: 'A handbook of agile software craftsmanship', price: 35, category: 'books', stock: 200, rating: 4.9 },
      { name: 'MacBook Pro M3', description: 'Apple MacBook Pro with M3 chip 14 inch', price: 1999, category: 'electronics', stock: 25, rating: 4.9 },
      { name: 'Levi Jeans', description: 'Classic 501 straight fit jeans', price: 59, category: 'clothing', stock: 150, rating: 4.3 },
    ];
    await Product.insertMany(products);
    await clearCache('products:*');
    res.json({ success: true, message: '6 products seeded', count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
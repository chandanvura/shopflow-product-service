const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description required'],
    maxlength: 500
  },
  price: {
    type: Number,
    required: [true, 'Price required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category required'],
    enum: ['electronics', 'clothing', 'food', 'books', 'sports', 'other']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
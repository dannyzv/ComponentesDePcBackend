const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    specifications: { type: Object, default: {} },
  },
  { timestamps: true }
);

componentSchema.index({ name: 'text' });

module.exports = mongoose.model('Component', componentSchema);
const mongoose = require('mongoose');

const presetBuildSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    useType: {
      type: String,
      enum: ['gaming', 'office', 'editing', 'development'],
      required: true,
      index: true,
    },
    description: { type: String, default: '' },
    budget: { type: Number, min: 0, default: 0 },
    components: { type: Object, default: {} },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PresetBuild', presetBuildSchema);
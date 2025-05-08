const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    availability: {
      type: String,
      required: true,
      enum: ['Hour', 'Day', 'Week'],
    },
    status: {
      type: String,
      enum: ['Available', 'Borrowed', 'Unavailable'],
      default: 'Available',
    },
    prices: {
      hourly: { type: Number, min: 0, default: 0 },
      daily: { type: Number, min: 0, default: 0 },
      weekly: { type: Number, min: 0, default: 0 },
    },
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
    img: {
      data: { type: Buffer, required: false },
      contentType: { type: String, required: false },
    },
  },
  { timestamps: true }
);

ItemSchema.index({ 'prices.hourly': 1, 'prices.daily': 1, 'prices.weekly': 1 });

module.exports = mongoose.model('Item', ItemSchema);
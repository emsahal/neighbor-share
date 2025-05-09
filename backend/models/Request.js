const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    type: String,
    enum: ['Hour', 'Day', 'Week'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Completed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rentalStartTime: {
    type: Date, 
  },
});

module.exports = mongoose.model('Request', requestSchema);
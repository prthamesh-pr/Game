const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  imageData: {
    type: String, // base64 or image URL
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);

const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roundNumber: { type: Number, required: true },
  numbers: [{ type: Number, min: 1, max: 99, required: true }],
  amount: { type: Number, required: true },
  timeSlot: { type: String },
  status: { type: String, enum: ['placed', 'won', 'lost'], default: 'placed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bet', betSchema);

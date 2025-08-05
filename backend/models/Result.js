const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true
  },
  winningNumber: {
    type: Number,
    required: true
  },
  gameClass: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  winningAmount: {
    type: Number,
    default: 0
  },
  resultDeclaredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
resultSchema.index({ roundId: 1 });
resultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);

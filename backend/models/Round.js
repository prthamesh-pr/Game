const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  resultNumber: { type: Number },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

module.exports = mongoose.model('Round', roundSchema);

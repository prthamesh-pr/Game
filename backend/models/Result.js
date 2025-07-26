const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true
  },
  classA: {
    winningNumber: {
      type: String,
      match: [/^\d{3}$/, 'Winning number must be exactly 3 digits']
    },
    totalBets: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    winnersCount: { type: Number, default: 0 }
  },
  classB: {
    winningNumber: {
      type: String,
      match: [/^\d{3}$/, 'Winning number must be exactly 3 digits']
    },
    totalBets: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    winnersCount: { type: Number, default: 0 }
  },
  classC: {
    winningNumber: {
      type: String,
      match: [/^\d{3}$/, 'Winning number must be exactly 3 digits']
    },
    totalBets: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    winnersCount: { type: Number, default: 0 }
  },
  classD: {
    winningNumber: {
      type: String,
      match: [/^[1-9]$/, 'Winning number must be a single digit (1-9)']
    },
    totalBets: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    winnersCount: { type: Number, default: 0 }
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  resultPostedAt: {
    type: Date
  },
  resultPostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  winners: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    classType: {
      type: String,
      enum: ['A', 'B', 'C', 'D']
    },
    number: String,
    betAmount: Number,
    winningAmount: Number
  }],
  totalParticipants: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalPayout: {
    type: Number,
    default: 0
  },
  houseProfit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
resultSchema.index({ roundId: 1 }, { unique: true });
resultSchema.index({ startTime: -1 });
resultSchema.index({ status: 1 });
resultSchema.index({ 'winners.userId': 1 });

// Virtual for round duration
resultSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime;
});

// Virtual for overall statistics
resultSchema.virtual('overallStats').get(function() {
  return {
    totalParticipants: this.totalParticipants,
    totalRevenue: this.totalRevenue,
    totalPayout: this.totalPayout,
    houseProfit: this.houseProfit,
    profitMargin: this.totalRevenue > 0 ? (this.houseProfit / this.totalRevenue * 100).toFixed(2) + '%' : '0%'
  };
});

// Instance method to add winner
resultSchema.methods.addWinner = function(userId, classType, number, betAmount, winningAmount) {
  this.winners.push({
    userId,
    classType,
    number,
    betAmount,
    winningAmount
  });
  
  // Update class-specific stats
  const classKey = `class${classType}`;
  this[classKey].winnersCount += 1;
  this[classKey].totalWinnings += winningAmount;
  
  // Update overall stats
  this.totalPayout += winningAmount;
  this.houseProfit = this.totalRevenue - this.totalPayout;
  
  return this.save();
};

// Instance method to complete round
resultSchema.methods.completeRound = function(adminId) {
  this.status = 'completed';
  this.resultPostedAt = new Date();
  this.resultPostedBy = adminId;
  return this.save();
};

// Static method to get current active round
resultSchema.statics.getCurrentRound = function() {
  return this.findOne({
    status: 'active',
    startTime: { $lte: new Date() },
    endTime: { $gte: new Date() }
  });
};

// Static method to get recent results
resultSchema.statics.getRecentResults = function(limit = 10) {
  return this.find({ status: 'completed' })
    .sort({ endTime: -1 })
    .limit(limit)
    .populate('resultPostedBy', 'fullName email');
};

// Static method to get results by date range
resultSchema.statics.getResultsByDateRange = function(startDate, endDate) {
  return this.find({
    status: 'completed',
    startTime: { $gte: startDate },
    endTime: { $lte: endDate }
  }).sort({ startTime: -1 });
};

module.exports = mongoose.model('Result', resultSchema);

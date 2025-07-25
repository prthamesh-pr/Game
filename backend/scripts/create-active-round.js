/**
 * Create an active game round for testing
 */

const mongoose = require('mongoose');
const Result = require('../models/Result');

async function createActiveRound() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Close any existing active rounds
    await Result.updateMany(
      { status: 'active' },
      { status: 'completed' }
    );
    console.log('🔄 Closed existing active rounds');

    // Get the next round number
    const lastResult = await Result.findOne().sort({ roundNumber: -1 });
    const nextRoundNumber = lastResult ? lastResult.roundNumber + 1 : 1;

    // Create new active round
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const activeRound = new Result({
      roundId: `R${nextRoundNumber}-${Date.now()}`,
      roundNumber: nextRoundNumber,
      status: 'active',
      startTime: startTime,
      endTime: endTime,
      classA: {
        totalBets: 0,
        totalAmount: 0,
        totalWinnings: 0,
        winnersCount: 0
      },
      classB: {
        totalBets: 0,
        totalAmount: 0,
        totalWinnings: 0,
        winnersCount: 0
      },
      classC: {
        totalBets: 0,
        totalAmount: 0,
        totalWinnings: 0,
        winnersCount: 0
      }
    });

    await activeRound.save();
    console.log('✅ Active round created successfully');
    console.log('🎮 Round Number:', nextRoundNumber);
    console.log('⏰ Start Time:', startTime.toISOString());
    console.log('⏰ End Time:', endTime.toISOString());
    console.log('📝 Round ID:', activeRound._id);

  } catch (error) {
    console.error('❌ Error creating active round:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run only if called directly
if (require.main === module) {
  createActiveRound();
}

module.exports = createActiveRound;

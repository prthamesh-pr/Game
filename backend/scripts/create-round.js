require('dotenv').config();
const mongoose = require('mongoose');
const Result = require('../models/Result');

async function createActiveRound() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if there's already an active round that hasn't expired
    const currentTime = new Date();
    const existingActiveRound = await Result.findOne({ 
      status: 'active',
      endTime: { $gt: currentTime }
    });
    if (existingActiveRound) {
      console.log(`✅ Active round already exists: ${existingActiveRound.roundId}`);
      console.log(`   Start: ${existingActiveRound.startTime}`);
      console.log(`   End: ${existingActiveRound.endTime}`);
      await mongoose.connection.close();
      return;
    }

    // Mark any expired active rounds as completed
    await Result.updateMany(
      { status: 'active', endTime: { $lte: currentTime } },
      { status: 'completed' }
    );

    // Create new round
    const now = new Date();
    const roundId = `ROUND_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Round runs for 30 minutes from now
    const startTime = now;
    const endTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes later

    const newRound = new Result({
      roundId: roundId,
      startTime: startTime,
      endTime: endTime,
      status: 'active',
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
      },
      totalParticipants: 0,
      totalRevenue: 0,
      totalPayout: 0,
      houseProfit: 0
    });

    await newRound.save();
    console.log(`✅ Active round created successfully!`);
    console.log(`   Round ID: ${roundId}`);
    console.log(`   Start Time: ${startTime.toISOString()}`);
    console.log(`   End Time: ${endTime.toISOString()}`);
    console.log(`   Duration: 30 minutes`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating active round:', error);
    process.exit(1);
  }
}

createActiveRound();

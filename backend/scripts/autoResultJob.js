const Result = require('../models/Result');
const NumberSelection = require('../models/NumberSelection');
const { generateRandomNumberForClass } = require('../utils/numberUtils');
const mongoose = require('mongoose');

async function autoResultJob() {
  await mongoose.connect(process.env.MONGO_URI);
  const now = new Date();
  // Find rounds in locked period (last 10 min), not completed, and no result after 6 min
  const rounds = await Result.find({
    status: 'active',
    endTime: { $gte: now, $lte: new Date(now.getTime() + 10 * 60000) },
    resultPostedAt: null
  });
  for (const round of rounds) {
    const lockedStart = new Date(round.endTime.getTime() - 10 * 60000);
    if (now > lockedStart && now - lockedStart > 6 * 60000) {
      // For each class, if no result, pick number with least bets or random
      ['A','B','C','D'].forEach(async classType => {
        if (!round[`class${classType}`].winningNumber) {
          // Find numbers with least bets
          const selections = await NumberSelection.find({ roundId: round.roundId, classType });
          let winningNumber;
          if (selections.length) {
            const betCounts = {};
            selections.forEach(sel => {
              betCounts[sel.number] = (betCounts[sel.number] || 0) + sel.amount;
            });
            const minBet = Math.min(...Object.values(betCounts));
            const candidates = Object.keys(betCounts).filter(n => betCounts[n] === minBet);
            winningNumber = candidates[Math.floor(Math.random() * candidates.length)];
          } else {
            winningNumber = generateRandomNumberForClass(classType);
          }
          round[`class${classType}`].winningNumber = winningNumber;
        }
      });
      round.resultPostedAt = now;
      await round.save();
      // Log auto result
      console.log(`Auto result generated for round ${round.roundId} at ${now}`);
    }
  }
  mongoose.disconnect();
}

module.exports = autoResultJob;

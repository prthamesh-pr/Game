/**
 * Auto Result Job - Generates automated results for game rounds
 * This is a simple replacement for the deleted autoResultJobNew script
 */

const mongoose = require('mongoose');
const Round = require('../models/Round');
const Result = require('../models/Result');

let jobRunning = false;

/**
 * Generates a random winning number between 100-999
 */
function generateWinningNumber() {
  return Math.floor(Math.random() * 900) + 100;
}

/**
 * Auto result generation job
 */
async function startAutoResultJob() {
  console.log('🎯 Auto Result Job started');
  
  // For now, just log that the job is running
  // In production, you might want to implement actual result generation logic
  setInterval(async () => {
    if (jobRunning) return;
    
    try {
      jobRunning = true;
      
      // Find completed rounds without results
      const completedRounds = await Round.find({
        status: 'active',
        endTime: { $lt: new Date() }
      }).limit(5);

      for (const round of completedRounds) {
        // Check if result already exists
        const existingResult = await Result.findOne({
          gameClass: round.gameClass,
          timeSlot: round.timeSlot,
          gameDate: {
            $gte: new Date(round.gameDate.setHours(0, 0, 0, 0)),
            $lt: new Date(round.gameDate.setHours(23, 59, 59, 999))
          }
        });

        if (!existingResult) {
          // Generate result
          const winningNumber = generateWinningNumber();
          
          await Result.create({
            gameClass: round.gameClass,
            timeSlot: round.timeSlot,
            gameDate: round.gameDate,
            winningNumber: winningNumber.toString(),
            resultDeclaredAt: new Date()
          });

          // Update round status
          await Round.findByIdAndUpdate(round._id, {
            status: 'completed',
            winningNumber: winningNumber.toString(),
            resultDeclaredAt: new Date()
          });

          console.log(`✅ Result generated for ${round.gameClass}-${round.timeSlot}: ${winningNumber}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Auto result job error:', error.message);
    } finally {
      jobRunning = false;
    }
  }, 60000); // Run every minute
}

module.exports = {
  startAutoResultJob,
  generateWinningNumber
};

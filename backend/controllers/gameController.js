const Bet = require('../models/Bet');
const Round = require('../models/Round');
const Result = require('../models/Result');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
// Calculate sum of digits for result logic
const calculateDigitSum = (number) => {
  return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
};

// Get the unit digit from a number
const getUnitDigit = (number) => {
  const sum = calculateDigitSum(number);
  return sum % 10;
};

// Check if a bet wins based on the result
const checkWinningBet = (selectedNumber, winningNumber, gameClass) => {
  // Direct match always wins
  if (selectedNumber === winningNumber) {
    return true;
  }

  // For Class D, also check if the unit digit matches
  if (gameClass === 'D') {
    const selectedDigit = parseInt(selectedNumber);
    const winningDigit = getUnitDigit(parseInt(winningNumber));
    return selectedDigit === winningDigit;
  }

  // For other classes, check if selected single digit matches the unit digit of result
  if (selectedNumber.length === 1 && winningNumber.length >= 3) {
    const selectedDigit = parseInt(selectedNumber);
    const winningDigit = getUnitDigit(parseInt(winningNumber));
    return selectedDigit === winningDigit;
  }

  return false;
};

// Game numbers for each class with the new structure
const GAME_NUMBERS = {
  A: [
    '0', '127', '136', '145', '190', '235', '280', '370', '479', '460', '569', '389', '578',
    '1', '128', '137', '146', '236', '245', '290', '380', '470', '489', '560', '678', '579',
    '2', '129', '138', '147', '156', '237', '246', '345', '390', '480', '570', '589', '679',
    '3', '120', '139', '148', '157', '238', '247', '256', '346', '490', '580', '175', '256',
    '4', '130', '149', '158', '167', '239', '248', '257', '347', '356', '590', '680', '789',
    '5', '140', '159', '168', '230', '249', '258', '267', '348', '357', '456', '690', '780',
    '6', '123', '150', '169', '178', '240', '259', '268', '349', '358', '457', '367', '790',
    '7', '124', '160', '179', '250', '269', '278', '340', '359', '368', '458', '467', '890',
    '8', '125', '134', '170', '189', '260', '279', '350', '369', '378', '459', '567', '468',
    '9', '135', '180', '234', '270', '289', '360', '379', '450', '469', '478', '568', '679'
  ],
  B: [
    '0', '550', '668', '244', '299', '226', '334', '488', '667', '118',
    '1', '100', '119', '155', '227', '335', '344', '399', '588', '669',
    '2', '200', '110', '228', '255', '336', '449', '660', '688', '778',
    '3', '300', '166', '229', '337', '355', '445', '599', '779', '788',
    '4', '400', '112', '220', '266', '338', '446', '455', '699', '770',
    '5', '500', '113', '122', '177', '339', '366', '447', '799', '889',
    '6', '600', '114', '277', '330', '448', '466', '556', '880', '899',
    '7', '700', '115', '133', '188', '223', '377', '449', '557', '566',
    '8', '800', '116', '224', '233', '288', '440', '477', '558', '990',
    '9', '900', '117', '144', '199', '225', '388', '559', '577', '667'
  ],
  C: ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'],
  D: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
};

// Get available numbers for each game class
const getGameNumbers = async (req, res) => {
  try {
    res.json({
      success: true,
      data: GAME_NUMBERS,
      message: 'Game numbers fetched successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching game numbers' 
    });
  }
};

// Place a bet
const placeBet = async (req, res) => {
  try {
    const { gameClass, selectedNumber, betAmount, timeSlot } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!gameClass || !selectedNumber || !betAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: gameClass, selectedNumber, betAmount' 
      });
    }

    // Ensure betAmount is a number
    const betAmountNum = Number(betAmount);
    if (isNaN(betAmountNum) || betAmountNum <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bet amount must be a valid number greater than 0' 
      });
    }

    // Validate game class
    if (!['A', 'B', 'C', 'D'].includes(gameClass)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid game class. Must be A, B, C, or D' 
      });
    }

    // Validate selected number for game class
    if (!GAME_NUMBERS[gameClass].includes(selectedNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid number ${selectedNumber} for game class ${gameClass}` 
      });
    }

    // Validate bet amount
    if (betAmountNum <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bet amount must be greater than 0' 
      });
    }

    // Check user balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log(`User ${userId} balance check:`);
    console.log(`- walletBalance: ${user.walletBalance}`);
    console.log(`- wallet: ${user.wallet}`);
    console.log(`- betAmount: ${betAmountNum}`);
    console.log(`- betAmount type: ${typeof betAmountNum}`);

    const currentBalance = user.walletBalance || user.wallet || 0;
    console.log(`- currentBalance: ${currentBalance}`);
    console.log(`- comparison: ${currentBalance} < ${betAmountNum} = ${currentBalance < betAmountNum}`);

    if (currentBalance < betAmountNum) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Available: ${currentBalance}, Required: ${betAmountNum}` 
      });
    }

    // Get or create current round
    let currentRound = await Round.findOne({ status: 'active' });
    if (!currentRound) {
      // Generate a unique round number
      const roundCount = await Round.countDocuments();
      const timeSlotValue = timeSlot || new Date().toISOString();
      currentRound = new Round({
        gameClass: 'A', // Default to A, since we support all classes in one round
        timeSlot: timeSlotValue,
        status: 'active'
      });
      await currentRound.save();
    }

    // Create bet
    const bet = new Bet({
      userId,
      roundId: currentRound._id,
      gameClass,
      selectedNumber,
      betAmount: betAmountNum,
      timeSlot: timeSlot || new Date().toISOString(),
      status: 'pending'
    });

    await bet.save();

    // Deduct amount from wallet
    const previousBalance = user.walletBalance || user.wallet || 0;
    user.walletBalance = previousBalance - betAmountNum;
    
    // Also update wallet field for backward compatibility
    user.wallet = user.walletBalance;
    
    console.log(`Balance updated: ${previousBalance} - ${betAmountNum} = ${user.walletBalance}`);
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'bet_placed',
      amount: -betAmountNum,
      status: 'completed',
      description: `Bet placed on ${gameClass}-${selectedNumber}`
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      data: {
        bet,
        newWalletBalance: user.walletBalance,
        remainingBalance: user.walletBalance
      }
    });
  } catch (err) {
    console.error('Error placing bet:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error placing bet' 
    });
  }
};

// Get current user's bets
const getUserBets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, gameClass, status } = req.query;

    // Build query
    const query = { userId };
    if (gameClass) query.gameClass = gameClass;
    if (status) query.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bets = await Bet.find(query)
      .populate('roundId', 'timeSlot status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBets = await Bet.countDocuments(query);
    const totalPages = Math.ceil(totalBets / parseInt(limit));

    res.json({
      success: true,
      data: {
        bets,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBets,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'User bets fetched successfully'
    });
  } catch (err) {
    console.error('Error fetching user bets:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user bets' 
    });
  }
};

// Get current round information
const getCurrentRound = async (req, res) => {
  try {
    let currentRound = await Round.findOne({ status: 'active' });
    
    if (!currentRound) {
      // Create a new round if none exists
      const timeSlot = new Date().toISOString();
      currentRound = new Round({
        gameClass: 'A', // Default to A, since we support all classes in one round
        timeSlot: timeSlot,
        status: 'active'
      });
      await currentRound.save();
    }

    res.json({
      success: true,
      data: currentRound,
      message: 'Current round fetched successfully'
    });
  } catch (err) {
    console.error('Error fetching current round:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching current round' 
    });
  }
};

// Get game results
const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('roundId', 'roundNumber')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: results,
      message: 'Results fetched successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching results' 
    });
  }
};

// Generate winning number (admin-favorable algorithm)
const generateWinningNumber = async (roundId) => {
  try {
    // Get all bets for this round
    const bets = await Bet.find({ roundId, status: 'pending' });
    
    if (bets.length === 0) {
      // No bets, pick random number from all classes
      const allNumbers = Object.values(GAME_NUMBERS).flat();
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      return allNumbers[randomIndex];
    }

    // Count total bet amounts for each number
    const numberStats = {};
    
    // Initialize stats for all possible numbers
    for (const gameClass in GAME_NUMBERS) {
      for (const number of GAME_NUMBERS[gameClass]) {
        numberStats[number] = {
          totalAmount: 0,
          betCount: 0,
          gameClass
        };
      }
    }

    // Calculate stats from bets, considering both direct matches and digit sum matches
    bets.forEach(bet => {
      // Count direct bets on this number
      if (numberStats[bet.selectedNumber]) {
        numberStats[bet.selectedNumber].totalAmount += bet.betAmount;
        numberStats[bet.selectedNumber].betCount += 1;
      }

      // For each potential winning number, check if this bet would win
      for (const potentialWinner in numberStats) {
        if (checkWinningBet(bet.selectedNumber, potentialWinner, bet.gameClass)) {
          numberStats[potentialWinner].totalAmount += bet.betAmount;
          numberStats[potentialWinner].betCount += 1;
        }
      }
    });

    // Find number with least total potential payout (admin favorable)
    let winningNumber = GAME_NUMBERS.D[0]; // Default to '0'
    let minAmount = Infinity;

    for (const [number, stats] of Object.entries(numberStats)) {
      if (stats.totalAmount < minAmount) {
        minAmount = stats.totalAmount;
        winningNumber = number;
      }
    }

    return winningNumber;
  } catch (err) {
    console.error('Error generating winning number:', err);
    // Fallback to random number
    const allNumbers = Object.values(GAME_NUMBERS).flat();
    const randomIndex = Math.floor(Math.random() * allNumbers.length);
    return allNumbers[randomIndex];
  }
};

// Auto-generate results (called by cron job)
const autoGenerateResults = async () => {
  try {
    // Find active round
    const activeRound = await Round.findOne({ status: 'active' });
    if (!activeRound) {
      console.log('No active round found');
      return;
    }

    // Generate winning number
    const winningNumber = await generateWinningNumber(activeRound._id);
    
    // Find winning game class
    let winningGameClass = 'D';
    for (const [gameClass, numbers] of Object.entries(GAME_NUMBERS)) {
      if (numbers.includes(winningNumber)) {
        winningGameClass = gameClass;
        break;
      }
    }

    // Create result
    const result = new Result({
      roundId: activeRound._id,
      winningNumber: winningNumber,
      gameClass: winningGameClass,
      createdAt: new Date()
    });

    await result.save();

    // Update round status
    activeRound.status = 'completed';
    activeRound.resultDeclaredAt = new Date();
    await activeRound.save();

    // Process all bets for this round
    const bets = await Bet.find({ roundId: activeRound._id, status: 'pending' });
    
    for (const bet of bets) {
      if (checkWinningBet(bet.selectedNumber, winningNumber, bet.gameClass)) {
        // Winner - multiply by 4
        bet.status = 'won';
        bet.winAmount = bet.betAmount * 4;
        
        // Add winnings to user wallet
        const user = await User.findById(bet.userId);
        if (user) {
          user.walletBalance += bet.winAmount;
          await user.save();

          // Create winning transaction
          const transaction = new Transaction({
            userId: bet.userId,
            type: 'win',
            amount: bet.winAmount,
            status: 'completed',
            description: `Won ${bet.winAmount} tokens for bet on ${bet.gameClass}-${bet.selectedNumber}, Result: ${winningGameClass}-${winningNumber}`
          });

          await transaction.save();
        }
      } else {
        // Loser
        bet.status = 'lost';
        bet.winAmount = 0;
      }
      
      await bet.save();
    }

    console.log(`Result generated for round ${activeRound._id}: ${winningGameClass}-${winningNumber}`);
    return result;
  } catch (err) {
    console.error('Error auto-generating results:', err);
  }
};

module.exports = {
  getGameNumbers,
  placeBet,
  getUserBets,
  getCurrentRound,
  getResults,
  generateWinningNumber,
  autoGenerateResults
};
